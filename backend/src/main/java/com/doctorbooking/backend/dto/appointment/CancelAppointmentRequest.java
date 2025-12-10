package com.doctorbooking.backend.dto.appointment;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

@Data
public class CancelAppointmentRequest {
    @NotBlank(message = "Cancellation reason is required")
    private String cancellationReason;
}
