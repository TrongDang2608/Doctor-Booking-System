package com.doctorbooking.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentMedicationRequest {
    private Long id; // for update
    private Long medicationId; // optional link to master medication
    private String medicationName;
    private String dosage;
    private String frequency;
    private String duration;
    private Integer quantity;
    private String unit;
    private String instructions;
    private BigDecimal price;
    private Integer orderIndex;
}

