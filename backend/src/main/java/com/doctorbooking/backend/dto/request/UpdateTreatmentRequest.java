package com.doctorbooking.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTreatmentRequest {
    private String diagnosis;
    private String diagnosisCode;
    private String prescription;
    private String treatmentNotes;
    private String advice;
    private String pharmacyInstructions;
    private LocalDate followUpDate;
    private List<TreatmentMedicationRequest> medications;
}

