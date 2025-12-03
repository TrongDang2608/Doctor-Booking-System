package com.doctorbooking.backend.dto.response;

import com.doctorbooking.backend.model.Doctor;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String specialization;
    private String qualification;
    private Integer experience;
    private String phone;
    private String address;
    private String bio;
    private String status;
    private BigDecimal consultationFee; // Phí khám bệnh
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DoctorResponse fromEntity(Doctor doctor) {
        DoctorResponse response = new DoctorResponse();
        response.setId(doctor.getId());
        response.setUserId(doctor.getUser().getId());
        response.setUsername(doctor.getUser().getUsername());
        response.setEmail(doctor.getUser().getEmail());
        response.setFullName(doctor.getFullName());
        response.setSpecialization(doctor.getSpecialization());
        response.setQualification(doctor.getQualification());
        response.setExperience(doctor.getExperience());
        response.setPhone(doctor.getPhone());
        response.setAddress(doctor.getAddress());
        response.setBio(doctor.getBio());
        response.setStatus(doctor.getStatus().name());
        response.setConsultationFee(doctor.getConsultationFee() != null ? doctor.getConsultationFee() : BigDecimal.ZERO);
        response.setCreatedAt(doctor.getCreatedAt());
        response.setUpdatedAt(doctor.getUpdatedAt());
        return response;
    }
}

