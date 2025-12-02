package com.doctorbooking.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopUpResponse {
    private String paymentUrl;
    private String transactionId;
}

