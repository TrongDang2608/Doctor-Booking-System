package com.doctorbooking.backend.config;

import com.doctorbooking.backend.service.UserService;
import com.doctorbooking.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Collection;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/public/")
                || path.startsWith("/api/auth/")
                || path.equals("/error");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        // Skip JWT filter for OPTIONS requests (preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            username = jwtUtil.extractUsername(jwt);
            logger.info("JWT Filter - Extracted username from token: {}", username);
            logger.info("JWT Filter - Request URI: {}", request.getRequestURI());

            // Clear existing authentication to ensure stateless behavior
            // This allows multiple users/roles to login simultaneously
            SecurityContextHolder.clearContext();

            if (username != null) {
                UserDetails userDetails = userService.loadUserByUsername(username);
                logger.info("JWT Filter - Loaded userDetails for username: {}", username);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    // Use authorities from UserDetails (already contains ROLE_ prefix)
                    // This ensures role is always loaded from database, not from token
                    Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();

                    // Log authorities at INFO level for troubleshooting
                    String authoritiesStr = authorities.stream()
                            .map(GrantedAuthority::getAuthority)
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("none");
                    logger.info("JWT Filter - User: {} authenticated with authorities: {}", username, authoritiesStr);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("JWT Filter - Authentication token set in SecurityContext");
                } else {
                    logger.warn("JWT Filter - Token validation failed for user: {}", username);
                    // Clear context if token is invalid
                    SecurityContextHolder.clearContext();
                }
            } else {
                logger.warn("JWT Filter - Username is null");
                SecurityContextHolder.clearContext();
            }
        } catch (Exception e) {
            // Token invalid, clear context and continue without authentication
            logger.error("JWT Filter - Authentication error: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
