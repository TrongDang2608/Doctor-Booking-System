package com.doctorbooking.backend.dto.request;

import com.doctorbooking.backend.model.Appointment;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class UpdateAppointmentRequest {
    private Appointment.AppointmentStatus status;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String notes;
}
