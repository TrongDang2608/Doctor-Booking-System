package com.doctorbooking.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentPaymentResponse {
    private Long appointmentId;
    private String paymentUrl;
    private String referenceId;
}

