package com.doctorbooking.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WalletResponse {
    private BigDecimal balance;
    private Integer loyaltyPoints;
    private String loyaltyTier;
}

