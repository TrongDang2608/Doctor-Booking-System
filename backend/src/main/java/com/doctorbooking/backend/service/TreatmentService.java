package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.request.CreateTreatmentRequest;
import com.doctorbooking.backend.dto.request.TreatmentMedicationRequest;
import com.doctorbooking.backend.dto.request.UpdateTreatmentRequest;
import com.doctorbooking.backend.dto.response.TreatmentResponse;
import com.doctorbooking.backend.model.Appointment;
import com.doctorbooking.backend.model.Doctor;
import com.doctorbooking.backend.model.Medication;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.model.PrescriptionMedication;
import com.doctorbooking.backend.model.Treatment;
import com.doctorbooking.backend.repository.AppointmentRepository;
import com.doctorbooking.backend.repository.DoctorRepository;
import com.doctorbooking.backend.repository.MedicationRepository;
import com.doctorbooking.backend.repository.PatientRepository;
import com.doctorbooking.backend.repository.PrescriptionMedicationRepository;
import com.doctorbooking.backend.repository.TreatmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TreatmentService {

    private final TreatmentRepository treatmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicationRepository medicationRepository;
    private final PrescriptionMedicationRepository prescriptionMedicationRepository;
    private final EmailService emailService;

    public List<TreatmentResponse> getAllTreatments() {
        return treatmentRepository.findAll().stream()
                .map(TreatmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TreatmentResponse> getTreatmentsByDoctorId(Long doctorId) {
        return treatmentRepository.findByDoctorId(doctorId).stream()
                .map(TreatmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TreatmentResponse> getTreatmentsByPatientId(Long patientId) {
        return treatmentRepository.findByPatientId(patientId).stream()
                .map(TreatmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TreatmentResponse getTreatmentById(Long id) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment not found with id: " + id));
        return TreatmentResponse.fromEntity(treatment);
    }

    public TreatmentResponse getTreatmentByAppointmentId(Long appointmentId) {
        List<Treatment> treatments = treatmentRepository.findByAppointmentId(appointmentId);
        if (treatments.isEmpty()) {
            return null;
        }
        // Return the first treatment (should only be one per appointment)
        return TreatmentResponse.fromEntity(treatments.get(0));
    }

    @Transactional
    public TreatmentResponse createTreatment(Long doctorId, CreateTreatmentRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + request.getPatientId()));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElse(null); // Appointment is optional
        }

        Treatment treatment = new Treatment();
        treatment.setDoctor(doctor);
        treatment.setPatient(patient);
        treatment.setAppointment(appointment);
        treatment.setDiagnosis(request.getDiagnosis());
        treatment.setDiagnosisCode(request.getDiagnosisCode());
        treatment.setPrescription(request.getPrescription());
        treatment.setTreatmentNotes(request.getTreatmentNotes());
        treatment.setAdvice(request.getAdvice());
        treatment.setPharmacyInstructions(request.getPharmacyInstructions());
        treatment.setFollowUpDate(request.getFollowUpDate());
        // generate prescriptionId
        treatment.setPrescriptionId(generatePrescriptionId(doctorId));

        treatment = treatmentRepository.save(treatment);

        // Save medications
        saveMedications(treatment, request.getMedications());

        // If treatment is created for an appointment, mark appointment as COMPLETED
        if (appointment != null && appointment.getStatus() == Appointment.AppointmentStatus.CONFIRMED) {
            appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
        }

        // Send e-prescription email to patient
        sendPrescriptionEmail(patient, doctor, treatment);

        return TreatmentResponse.fromEntity(treatment);
    }

    @Transactional
    public TreatmentResponse updateTreatment(Long id, UpdateTreatmentRequest request) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment not found with id: " + id));

        if (request.getDiagnosis() != null) {
            treatment.setDiagnosis(request.getDiagnosis());
        }
        if (request.getDiagnosisCode() != null) {
            treatment.setDiagnosisCode(request.getDiagnosisCode());
        }
        if (request.getPrescription() != null) {
            treatment.setPrescription(request.getPrescription());
        }
        if (request.getTreatmentNotes() != null) {
            treatment.setTreatmentNotes(request.getTreatmentNotes());
        }
        if (request.getAdvice() != null) {
            treatment.setAdvice(request.getAdvice());
        }
        if (request.getPharmacyInstructions() != null) {
            treatment.setPharmacyInstructions(request.getPharmacyInstructions());
        }
        if (request.getFollowUpDate() != null) {
            treatment.setFollowUpDate(request.getFollowUpDate());
        }

        treatment = treatmentRepository.save(treatment);
        // update medications: clear then save
        if (request.getMedications() != null) {
            prescriptionMedicationRepository.deleteByTreatmentId(treatment.getId());
            treatment.getMedications().clear();
            saveMedications(treatment, request.getMedications());
        }
        // resend email on update
        sendPrescriptionEmail(treatment.getPatient(), treatment.getDoctor(), treatment);
        return TreatmentResponse.fromEntity(treatment);
    }

    @Transactional
    public void deleteTreatment(Long id) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment not found with id: " + id));
        treatmentRepository.delete(treatment);
    }

    private void saveMedications(Treatment treatment, List<TreatmentMedicationRequest> meds) {
        if (meds == null || meds.isEmpty()) {
            return;
        }
        int idx = 0;
        for (TreatmentMedicationRequest req : meds) {
            PrescriptionMedication pm = new PrescriptionMedication();
            pm.setTreatment(treatment);
            if (req.getMedicationId() != null) {
                Medication med = medicationRepository.findById(req.getMedicationId())
                        .orElse(null);
                pm.setMedication(med);
            }
            pm.setMedicationName(req.getMedicationName() != null ? req.getMedicationName() : "Unknown");
            pm.setDosage(req.getDosage() != null ? req.getDosage() : "");
            pm.setFrequency(req.getFrequency() != null ? req.getFrequency() : "");
            pm.setDuration(req.getDuration() != null ? req.getDuration() : "");
            pm.setQuantity(req.getQuantity());
            pm.setUnit(req.getUnit());
            pm.setInstructions(req.getInstructions());
            pm.setPrice(req.getPrice());
            pm.setOrderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : idx);
            idx++;
            prescriptionMedicationRepository.save(pm);
            treatment.getMedications().add(pm);
        }
    }

    private String generatePrescriptionId(Long doctorId) {
        long timestamp = System.currentTimeMillis();
        return "PRES-" + doctorId + "-" + timestamp;
    }

    private void sendPrescriptionEmail(Patient patient, Doctor doctor, Treatment treatment) {
        try {
            if (patient == null || patient.getUser() == null || patient.getUser().getEmail() == null) {
                return;
            }
            String toEmail = patient.getUser().getEmail();

            List<PrescriptionMedication> medsList = prescriptionMedicationRepository.findByTreatmentIdOrderByOrderIndexAsc(treatment.getId());
            DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String followUp = treatment.getFollowUpDate() != null 
                    ? treatment.getFollowUpDate().format(dateFmt) 
                    : "Không đặt";

            emailService.sendPrescriptionEmailHtml(
                    toEmail,
                    patient.getFullName() != null ? patient.getFullName() : "Bệnh nhân",
                    patient.getPhone() != null ? patient.getPhone() : "",
                    patient.getAddress() != null ? patient.getAddress() : "",
                    doctor.getFullName() != null ? doctor.getFullName() : "",
                    "BỆNH VIỆN GIAO THÔNG VẬN TẢI",
                    "70 Đ. Tô Ký, Tân Chánh Hiệp, Quận 12, Thành phố Hồ Chí Minh",
                    "0962.831.327",
                    treatment.getDiagnosisCode(),
                    treatment.getDiagnosis(),
                    treatment.getAdvice(),
                    followUp,
                    treatment.getPrescriptionId() != null ? treatment.getPrescriptionId() : "",
                    medsList
            );
        } catch (Exception ex) {
            // Không chặn luồng chính nếu email lỗi
            System.err.println("⚠️ Không gửi được email đơn thuốc: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
}

