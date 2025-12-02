package com.doctorbooking.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WalletTransactionResponse {
    private Long id;
    private String transactionType;
    private BigDecimal amount;
    private Integer pointsEarned;
    private String description;
    private String status;
    private String paymentMethod;
    private LocalDateTime createdAt;
}

