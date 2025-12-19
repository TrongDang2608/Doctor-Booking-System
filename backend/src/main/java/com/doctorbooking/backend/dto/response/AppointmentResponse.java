package com.doctorbooking.backend.dto.response;

import com.doctorbooking.backend.model.Appointment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private String patientPhone;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String status;
    private String notes;
    private BigDecimal price;
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean hasFeedback;

    public static AppointmentResponse fromEntity(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setPatientId(appointment.getPatient().getId());
        response.setPatientName(appointment.getPatient().getFullName());
        response.setPatientPhone(appointment.getPatient().getPhone());
        response.setDoctorId(appointment.getDoctor().getId());
        response.setDoctorName(appointment.getDoctor().getFullName());
        response.setDoctorSpecialization(appointment.getDoctor().getSpecialization());
        response.setAppointmentDate(appointment.getAppointmentDate());
        response.setAppointmentTime(appointment.getAppointmentTime());
        response.setStatus(appointment.getStatus().name());
        response.setNotes(appointment.getNotes());
        response.setPrice(appointment.getPrice() != null ? appointment.getPrice() : BigDecimal.ZERO);
        response.setPaymentStatus(appointment.getPaymentStatus() != null ? appointment.getPaymentStatus().name() : "PENDING");
        response.setPaymentMethod(appointment.getPaymentMethod());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());
        response.setHasFeedback(false); // Default value, will be set by service layer
        return response;
    }
}

