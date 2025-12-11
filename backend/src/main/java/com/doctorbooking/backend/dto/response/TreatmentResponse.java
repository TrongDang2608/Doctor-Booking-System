package com.doctorbooking.backend.dto.response;

import com.doctorbooking.backend.model.Treatment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentResponse {
    private Long id;
    private Long appointmentId;
    private Long doctorId;
    private String doctorName;
    private Long patientId;
    private String patientName;
    private String diagnosis;
    private String diagnosisCode;
    private String prescription;
    private String treatmentNotes;
    private String advice;
    private String pharmacyInstructions;
    private LocalDate followUpDate;
    private String prescriptionId;
    private String qrCodeUrl;
    private List<TreatmentMedicationResponse> medications;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TreatmentResponse fromEntity(Treatment treatment) {
        TreatmentResponse response = new TreatmentResponse();
        response.setId(treatment.getId());
        response.setAppointmentId(treatment.getAppointment() != null ? treatment.getAppointment().getId() : null);
        response.setDoctorId(treatment.getDoctor().getId());
        response.setDoctorName(treatment.getDoctor().getFullName());
        response.setPatientId(treatment.getPatient().getId());
        response.setPatientName(treatment.getPatient().getFullName());
        response.setDiagnosis(treatment.getDiagnosis());
        response.setDiagnosisCode(treatment.getDiagnosisCode());
        response.setPrescription(treatment.getPrescription());
        response.setTreatmentNotes(treatment.getTreatmentNotes());
        response.setAdvice(treatment.getAdvice());
        response.setPharmacyInstructions(treatment.getPharmacyInstructions());
        response.setFollowUpDate(treatment.getFollowUpDate());
        response.setPrescriptionId(treatment.getPrescriptionId());
        response.setQrCodeUrl(treatment.getQrCodeUrl());
        if (treatment.getMedications() != null) {
            response.setMedications(
                    treatment.getMedications().stream()
                            .map(TreatmentMedicationResponse::fromEntity)
                            .collect(Collectors.toList())
            );
        }
        response.setCreatedAt(treatment.getCreatedAt());
        response.setUpdatedAt(treatment.getUpdatedAt());
        return response;
    }
}

