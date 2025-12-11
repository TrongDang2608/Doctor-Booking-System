package com.doctorbooking.backend.dto.response;

import com.doctorbooking.backend.model.PrescriptionMedication;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentMedicationResponse {
    private Long id;
    private Long medicationId;
    private String medicationName;
    private String dosage;
    private String frequency;
    private String duration;
    private Integer quantity;
    private String unit;
    private String instructions;
    private BigDecimal price;
    private Integer orderIndex;

    public static TreatmentMedicationResponse fromEntity(PrescriptionMedication entity) {
        TreatmentMedicationResponse res = new TreatmentMedicationResponse();
        res.setId(entity.getId());
        res.setMedicationId(entity.getMedication() != null ? entity.getMedication().getId() : null);
        res.setMedicationName(entity.getMedicationName());
        res.setDosage(entity.getDosage());
        res.setFrequency(entity.getFrequency());
        res.setDuration(entity.getDuration());
        res.setQuantity(entity.getQuantity());
        res.setUnit(entity.getUnit());
        res.setInstructions(entity.getInstructions());
        res.setPrice(entity.getPrice());
        res.setOrderIndex(entity.getOrderIndex());
        return res;
    }
}

