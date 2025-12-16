package com.doctorbooking.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // Uncomment khi đổi lại BCrypt
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Tạm thời dùng PlainTextPasswordEncoder để test (KHÔNG dùng trong production!)
        // TODO: Đổi lại BCryptPasswordEncoder sau khi test xong
        return new PlainTextPasswordEncoder();
        // return new BCryptPasswordEncoder(); // Uncomment sau khi test xong
    }

    @Bean
    @SuppressWarnings("deprecation")
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Vô hiệu hóa CSRF vì chúng ta đang làm việc với API
                .csrf(csrf -> csrf.disable())
                // Cấu hình CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // Cấu hình session - STATELESS vì sử dụng JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Cấu hình quy tắc cho các request HTTP
                .authorizeHttpRequests(auth -> auth
                        // Cho phép OPTIONS requests (preflight) cho tất cả endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Cho phép các endpoint authentication không cần xác thực
                        .requestMatchers("/api/auth/**").permitAll()
                        // VNPAY callback endpoints - không cần authentication
                        .requestMatchers("/api/patient/payments/vnpay/callback").permitAll()
                        .requestMatchers("/api/patient/payments/vnpay/wallet-callback").permitAll()
                        .requestMatchers("/api/patient/payments/vnpay/appointment-callback").permitAll()
                        // Test endpoints để debug (không cần auth)
                        .requestMatchers("/api/test/**").permitAll()
                        // Public endpoints (health check, etc.)
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        // Admin endpoints chỉ dành cho ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Doctor endpoints chỉ dành cho DOCTOR
                        .requestMatchers("/api/doctor/**").hasRole("DOCTOR")
                        // Patient endpoints chỉ dành cho PATIENT
                        .requestMatchers("/api/patient/**").hasRole("PATIENT")
                        // Tất cả các request khác đều yêu cầu xác thực
                        .anyRequest().authenticated())
                // Thêm authentication provider
                .authenticationProvider(authenticationProvider())
                // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}