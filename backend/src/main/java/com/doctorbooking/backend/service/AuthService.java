package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.request.LoginRequest;
import com.doctorbooking.backend.dto.request.RegisterRequest;
import com.doctorbooking.backend.dto.response.AuthResponse;
import com.doctorbooking.backend.model.Admin;
import com.doctorbooking.backend.model.Doctor;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.model.User;
import com.doctorbooking.backend.repository.AdminRepository;
import com.doctorbooking.backend.repository.DoctorRepository;
import com.doctorbooking.backend.repository.PatientRepository;
import com.doctorbooking.backend.repository.UserRepository;
import com.doctorbooking.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create user
        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        // Tạm thời dùng plain text password (KHÔNG hash)
        user.setPassword(request.getPassword()); // Plain text
        // user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt -
        // uncomment sau khi test xong
        user.setEmail(request.getEmail());

        // Determine role
        User.Role role = User.Role.PATIENT; // Default
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid role, stick to default or throw error
                // For now, let's default to PATIENT but log it
                System.err.println("Invalid role provided: " + request.getRole());
            }
        }
        user.setRole(role);

        user.setEnabled(true);
        user = userRepository.save(user);

        // Create specific role entity
        switch (role) {
            case PATIENT:
                Patient patient = new Patient();
                patient.setUser(user);
                patient.setFullName(request.getFullName());
                patient.setPhone(request.getPhone());
                patientRepository.save(patient);
                break;
            case DOCTOR:
                Doctor doctor = new Doctor();
                doctor.setUser(user);
                doctor.setFullName(request.getFullName());
                doctor.setPhone(request.getPhone());
                // Initialize other doctor fields if necessary
                doctorRepository.save(doctor);
                break;
            case ADMIN:
                Admin admin = new Admin();
                admin.setUser(user);
                admin.setFullName(request.getFullName());
                // Initialize other admin fields if necessary
                adminRepository.save(admin);
                break;
        }

        // Generate tokens
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getId());

        String token = jwtUtil.generateToken(user, extraClaims);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(request.getFullName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Log login attempt
        System.out.println("🔵 AuthService.login - Attempting login for: " + request.getUsername());

        // Authenticate user - username field can be either username or email
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));
            System.out.println("✅ AuthService.login - Authentication successful for: " + request.getUsername());
        } catch (org.springframework.security.core.AuthenticationException e) {
            System.err.println("❌ AuthService.login - Authentication failed: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw để GlobalExceptionHandler xử lý
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // UserService.loadUserByUsername() trả về User entity (vì User implements
        // UserDetails)
        // Nên authentication.getPrincipal() sẽ là User object
        // Sử dụng trực tiếp để tránh query lại từ DB
        User user;
        if (userDetails instanceof User) {
            // Nếu UserDetails là User entity, sử dụng trực tiếp (không cần query lại)
            user = (User) userDetails;
            System.out.println("🔵 AuthService.login - Using User from authentication principal (ID: " + user.getId()
                    + ", Username: " + user.getUsername() + ")");
        } else {
            // Fallback: nếu không phải User entity, load từ database
            String usernameFromDetails = userDetails.getUsername();
            System.out.println("⚠️ AuthService.login - Principal is not User entity, loading from DB with username: "
                    + usernameFromDetails);
            user = userRepository.findByUsername(usernameFromDetails)
                    .orElse(userRepository.findByEmail(usernameFromDetails)
                            .orElseThrow(() -> {
                                System.err.println("❌ User not found with username/email: " + usernameFromDetails);
                                return new RuntimeException("User not found: " + usernameFromDetails);
                            }));
        }

        // Generate tokens
        // QUAN TRỌNG: Sử dụng user.getUsername() (username thực tế từ DB) thay vì
        // userDetails.getUsername()
        // Vì userDetails.getUsername() có thể trả về email nếu login bằng email
        // Nhưng token phải có subject là username thực tế để validate đúng
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getId());

        // Tạo UserDetails wrapper với username thực tế để tạo token
        UserDetails tokenUserDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername()) // Dùng username thực tế, không phải email
                .password(user.getPassword())
                .authorities(user.getAuthorities())
                .build();

        String token = jwtUtil.generateToken(tokenUserDetails, extraClaims);
        String refreshToken = jwtUtil.generateRefreshToken(tokenUserDetails);

        System.out.println("🔵 AuthService.login - Token created with username: " + user.getUsername());

        // Get full name based on role
        String fullName = getFullNameByRole(user);
        System.out.println("🔵 AuthService.login - FullName retrieved: " + fullName);

        // Build response
        AuthResponse response = AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(fullName)
                .build();

        System.out.println("✅ AuthService.login - Response built successfully");
        return response;
    }

    private String getFullNameByRole(User user) {
        try {
            return switch (user.getRole()) {
                case PATIENT -> {
                    Patient patient = patientRepository.findByUserId(user.getId())
                            .orElse(null);
                    yield patient != null ? patient.getFullName() : null;
                }
                case DOCTOR -> {
                    Doctor doctor = doctorRepository.findByUserId(user.getId())
                            .orElse(null);
                    yield doctor != null ? doctor.getFullName() : null;
                }
                case ADMIN -> {
                    Admin admin = adminRepository.findByUserId(user.getId())
                            .orElse(null);
                    yield admin != null ? admin.getFullName() : "Admin User"; // Default fallback
                }
            };
        } catch (Exception e) {
            System.err.println("❌ Error getting fullName for role " + user.getRole() + ": " + e.getMessage());
            e.printStackTrace();
            // Return default based on role
            return switch (user.getRole()) {
                case ADMIN -> "System Administrator";
                case DOCTOR -> "Doctor";
                case PATIENT -> "Patient";
            };
        }
    }
}
