package com.doctorbooking.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTreatmentRequest {
    private Long appointmentId;
    
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String diagnosis;
    private String diagnosisCode;
    private String prescription;
    private String treatmentNotes;
    private String advice;
    private String pharmacyInstructions;
    private LocalDate followUpDate;
    private List<TreatmentMedicationRequest> medications;
}

