package com.doctorbooking.backend.controller;

import com.doctorbooking.backend.dto.request.ChangePasswordRequest;
import com.doctorbooking.backend.dto.request.CreateAppointmentRequest;
import com.doctorbooking.backend.dto.request.CreateFeedbackRequest;
import com.doctorbooking.backend.dto.request.UpdatePatientProfileRequest;
import com.doctorbooking.backend.dto.response.*;
import com.doctorbooking.backend.model.User;
import com.doctorbooking.backend.service.*;
import com.doctorbooking.backend.dto.request.SymptomCheckRequest; // Thêm import
import com.doctorbooking.backend.dto.response.SymptomCheckResponse; // Thêm import
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;
    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final TreatmentService treatmentService;
    private final FeedbackService feedbackService;
    private final UserService userService;
    private final AISymptomService aiSymptomService;

    // ========== Profile Management ==========

    @GetMapping("/profile")
    public ResponseEntity<PatientResponse> getProfile() {
        try {
            Long userId = getCurrentUserId();
            PatientResponse profile = patientService.getPatientByUserId(userId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<PatientResponse> updateProfile(@Valid @RequestBody UpdatePatientProfileRequest request) {
        try {
            Long userId = getCurrentUserId();
            PatientResponse profile = patientService.updatePatientProfile(userId, request);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            Long userId = getCurrentUserId();
            patientService.changePassword(userId, request);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== Appointment Booking ==========

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        try {
            Long patientId = getCurrentPatientId();
            AppointmentResponse appointment = appointmentService.createAppointment(patientId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> getAppointments() {
        try {
            Long patientId = getCurrentPatientId();
            List<AppointmentResponse> appointments = appointmentService.getPatientAppointments(patientId);
            return ResponseEntity.ok(appointments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/appointments/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        try {
            AppointmentResponse appointment = appointmentService.getAppointmentById(id);
            Long patientId = getCurrentPatientId();

            // Verify the appointment belongs to this patient
            if (!appointment.getPatientId().equals(patientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        try {
            Long patientId = getCurrentPatientId();
            appointmentService.cancelAppointment(id, patientId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== Doctor Search ==========

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponse>> searchDoctors(
            @RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(doctorService.searchDoctors(search));
        }
        // Return only active doctors for patients
        return ResponseEntity.ok(doctorService.getActiveDoctors());
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable Long id) {
        try {
            DoctorResponse doctor = doctorService.getDoctorById(id);
            // Only return if doctor is active
            if (!doctor.getStatus().equals("ACTIVE")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(doctor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== Treatment Viewing ==========

    @GetMapping("/treatments")
    public ResponseEntity<List<TreatmentResponse>> getTreatments() {
        try {
            Long patientId = getCurrentPatientId();
            List<TreatmentResponse> treatments = treatmentService.getTreatmentsByPatientId(patientId);
            return ResponseEntity.ok(treatments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/treatments/{id}")
    public ResponseEntity<TreatmentResponse> getTreatmentById(@PathVariable Long id) {
        try {
            TreatmentResponse treatment = treatmentService.getTreatmentById(id);
            Long patientId = getCurrentPatientId();

            // Verify the treatment belongs to this patient
            if (!treatment.getPatientId().equals(patientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(treatment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/appointments/{id}/treatment")
    public ResponseEntity<TreatmentResponse> getTreatmentByAppointmentId(@PathVariable Long id) {
        try {
            AppointmentResponse appointment = appointmentService.getAppointmentById(id);
            Long patientId = getCurrentPatientId();

            // Verify the appointment belongs to this patient
            if (!appointment.getPatientId().equals(patientId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            TreatmentResponse treatment = treatmentService.getTreatmentByAppointmentId(id);
            if (treatment == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(treatment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== Feedback ==========

    @PostMapping("/feedbacks")
    public ResponseEntity<FeedbackResponse> createFeedback(@Valid @RequestBody CreateFeedbackRequest request) {
        try {
            Long patientId = getCurrentPatientId();
            FeedbackResponse feedback = feedbackService.createFeedback(patientId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(feedback);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<List<FeedbackResponse>> getFeedbacks() {
        try {
            Long patientId = getCurrentPatientId();
            List<FeedbackResponse> feedbacks = feedbackService.getPatientFeedbacks(patientId);
            return ResponseEntity.ok(feedbacks);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== Helper Methods ==========

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user.getId();
    }

    private Long getCurrentPatientId() {
        Long userId = getCurrentUserId();
        PatientResponse patient = patientService.getPatientByUserId(userId);
        return patient.getId();
    }

    // ========== Methods AISymptoms ==========
    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);

    @PostMapping("/ai/check-symptoms")
    public ResponseEntity<SymptomCheckResponse> checkSymptoms(@Valid @RequestBody SymptomCheckRequest request) {
        logger.info("Nhận request Check Triệu chứng từ Client. Input: {}", request.getSymptoms());
        try {
            SymptomCheckResponse response = aiSymptomService.analyzeSymptoms(request.getSymptoms());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Controller bắt được lỗi: ", e);
            return ResponseEntity.badRequest().build();
        }
    }
}

