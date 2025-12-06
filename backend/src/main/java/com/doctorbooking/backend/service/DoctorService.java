package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.request.ChangePasswordRequest;
import com.doctorbooking.backend.dto.request.DoctorRequest;
import com.doctorbooking.backend.dto.request.UpdateProfileRequest;
import com.doctorbooking.backend.dto.response.DoctorResponse;
import com.doctorbooking.backend.model.Doctor;
import com.doctorbooking.backend.model.User;
import com.doctorbooking.backend.repository.DoctorRepository;
import com.doctorbooking.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(DoctorResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<DoctorResponse> searchDoctors(String keyword) {
        return doctorRepository.searchDoctors(keyword).stream()
                .map(DoctorResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<DoctorResponse> getActiveDoctors() {
        return doctorRepository.findByStatus(Doctor.DoctorStatus.ACTIVE).stream()
                .map(DoctorResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public DoctorResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        return DoctorResponse.fromEntity(doctor);
    }

    @Transactional
    public DoctorResponse createDoctor(DoctorRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(User.Role.DOCTOR);
        user.setEnabled(true);
        user = userRepository.save(user);

        // Create doctor
        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setFullName(request.getFullName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperience(request.getExperience() != null ? request.getExperience() : 0);
        doctor.setPhone(request.getPhone());
        doctor.setAddress(request.getAddress());
        doctor.setBio(request.getBio());
        doctor.setStatus(Doctor.DoctorStatus.ACTIVE);
        doctor = doctorRepository.save(doctor);

        return DoctorResponse.fromEntity(doctor);
    }

    @Transactional
    public DoctorResponse updateDoctor(Long id, DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

        User user = doctor.getUser();

        // Update user if username or email changed
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty() 
                && !"current_password_unchanged".equals(request.getPassword())) {
            // Tạm thời dùng plain text password (KHÔNG hash)
            user.setPassword(request.getPassword()); // Plain text
            // user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt - uncomment sau khi test xong
        }

        userRepository.save(user);

        // Update doctor
        if (request.getFullName() != null) {
            doctor.setFullName(request.getFullName());
        }
        if (request.getSpecialization() != null) {
            doctor.setSpecialization(request.getSpecialization());
        }
        if (request.getQualification() != null) {
            doctor.setQualification(request.getQualification());
        }
        if (request.getExperience() != null) {
            doctor.setExperience(request.getExperience());
        }
        if (request.getPhone() != null) {
            doctor.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            doctor.setAddress(request.getAddress());
        }
        if (request.getBio() != null) {
            doctor.setBio(request.getBio());
        }

        doctor = doctorRepository.save(doctor);
        return DoctorResponse.fromEntity(doctor);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        doctorRepository.delete(doctor);
        // User will be deleted by cascade if configured
    }

    // Doctor Profile Management (for doctor themselves)
    public DoctorResponse getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with user id: " + userId));
        return DoctorResponse.fromEntity(doctor);
    }

    @Transactional
    public DoctorResponse updateDoctorProfile(Long userId, UpdateProfileRequest request) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with user id: " + userId));

        if (request.getFullName() != null) {
            doctor.setFullName(request.getFullName());
        }
        if (request.getSpecialization() != null) {
            doctor.setSpecialization(request.getSpecialization());
        }
        if (request.getQualification() != null) {
            doctor.setQualification(request.getQualification());
        }
        if (request.getExperience() != null) {
            doctor.setExperience(request.getExperience());
        }
        if (request.getPhone() != null) {
            doctor.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            doctor.setAddress(request.getAddress());
        }
        if (request.getBio() != null) {
            doctor.setBio(request.getBio());
        }

        doctor = doctorRepository.save(doctor);
        return DoctorResponse.fromEntity(doctor);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Verify current password (plain text comparison)
        if (!request.getCurrentPassword().equals(user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password (plain text - tạm thời)
        user.setPassword(request.getNewPassword()); // Plain text
        // user.setPassword(passwordEncoder.encode(request.getNewPassword())); // BCrypt - uncomment sau khi test xong
        userRepository.save(user);
    }
}

