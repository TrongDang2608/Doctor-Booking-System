package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.request.ChangePasswordRequest;
import com.doctorbooking.backend.dto.request.UpdateUserRequest;
import com.doctorbooking.backend.dto.request.UserRequest;
import com.doctorbooking.backend.dto.response.UserResponse;
import com.doctorbooking.backend.model.User;
import com.doctorbooking.backend.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        System.out.println("🔵 UserService.loadUserByUsername - Searching for: " + usernameOrEmail);
        
        // Try to find by username first, if not found, try email
        User user = userRepository.findByUsername(usernameOrEmail)
                .orElse(userRepository.findByEmail(usernameOrEmail)
                        .orElse(null));
        
        if (user != null) {
            System.out.println("✅ UserService.loadUserByUsername - Found user: " + user.getUsername() + " (ID: " + user.getId() + ", Role: " + user.getRole() + ")");
            return user;
        } else {
            System.err.println("❌ UserService.loadUserByUsername - User not found with username or email: " + usernameOrEmail);
            // Debug: List all usernames and emails
            long totalUsers = userRepository.count();
            System.err.println("❌ Total users in database: " + totalUsers);
            if (totalUsers > 0) {
                userRepository.findAll().forEach(u -> 
                    System.err.println("   - Username: '" + u.getUsername() + "', Email: '" + u.getEmail() + "', Role: " + u.getRole())
                );
            }
            throw new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail);
        }
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    // ========== User Management Methods ==========

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    public List<UserResponse> searchUsers(String search) {
        if (search == null || search.trim().isEmpty()) {
            return getAllUsers();
        }
        String searchLower = search.toLowerCase();
        return userRepository.findAll().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(searchLower) ||
                               user.getEmail().toLowerCase().contains(searchLower))
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return UserResponse.fromUser(user);
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);

        User savedUser = userRepository.save(user);
        return UserResponse.fromUser(savedUser);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Check if username is changed and already exists
        if (!user.getUsername().equals(request.getUsername()) &&
            userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email is changed and already exists
        if (!user.getEmail().equals(request.getEmail()) &&
            userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        User updatedUser = userRepository.save(user);
        return UserResponse.fromUser(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
    }

    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setEnabled(!user.getEnabled());
        User updatedUser = userRepository.save(user);
        return UserResponse.fromUser(updatedUser);
    }

    @Transactional
    public void changeUserPassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}

