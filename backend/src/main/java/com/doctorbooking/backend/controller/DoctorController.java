package com.doctorbooking.backend.controller;

import com.doctorbooking.backend.dto.request.ChangePasswordRequest;
import com.doctorbooking.backend.dto.request.CreateTreatmentRequest;
import com.doctorbooking.backend.dto.request.UpdateProfileRequest;
import com.doctorbooking.backend.dto.request.UpdateTreatmentRequest;
import com.doctorbooking.backend.dto.response.*;
import com.doctorbooking.backend.model.User;
import com.doctorbooking.backend.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorService doctorService;
    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final TreatmentService treatmentService;
    private final UserService userService;

    // ========== Profile Management ==========

    @GetMapping("/profile")
    public ResponseEntity<DoctorResponse> getProfile() {
        try {
            Long userId = getCurrentUserId();
            DoctorResponse profile = doctorService.getDoctorByUserId(userId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<DoctorResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            Long userId = getCurrentUserId();
            DoctorResponse profile = doctorService.updateDoctorProfile(userId, request);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            Long userId = getCurrentUserId();
            doctorService.changePassword(userId, request);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== Appointment Management ==========

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            Long doctorId = getCurrentDoctorId();
            System.out.println("🔍 Doctor ID: " + doctorId);
            
            if (date != null) {
                List<AppointmentResponse> allByDate = appointmentService.getAppointmentsByDate(date);
                System.out.println("📅 Total appointments on " + date + ": " + allByDate.size());
                
                List<AppointmentResponse> appointments = allByDate.stream()
                        .filter(a -> {
                            System.out.println("  - Appointment ID: " + a.getId() + ", Doctor ID: " + a.getDoctorId());
                            return a.getDoctorId().equals(doctorId);
                        })
                        .toList();
                System.out.println("✅ Filtered appointments: " + appointments.size());
                return ResponseEntity.ok(appointments);
            }
            
            // Get all appointments for this doctor
            List<AppointmentResponse> allAppointments = appointmentService.getAllAppointments();
            System.out.println("📋 Total appointments in system: " + allAppointments.size());
            
            List<AppointmentResponse> filtered = allAppointments.stream()
                    .filter(a -> {
                        System.out.println("  - Appointment ID: " + a.getId() + ", Doctor ID: " + a.getDoctorId() + ", Patient: " + a.getPatientName());
                        return a.getDoctorId().equals(doctorId);
                    })
                    .toList();
            System.out.println("✅ Filtered appointments for doctor " + doctorId + ": " + filtered.size());
            return ResponseEntity.ok(filtered);
        } catch (RuntimeException e) {
            System.err.println("❌ Error getting appointments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/appointments/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        try {
            AppointmentResponse appointment = appointmentService.getAppointmentById(id);
            Long doctorId = getCurrentDoctorId();
            
            // Verify the appointment belongs to this doctor
            if (!appointment.getDoctorId().equals(doctorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/appointments/{id}/confirm")
    public ResponseEntity<AppointmentResponse> confirmAppointment(@PathVariable Long id) {
        try {
            Long doctorId = getCurrentDoctorId();
            AppointmentResponse appointment = appointmentService.confirmAppointment(id, doctorId);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== Treatment Management ==========

    @GetMapping("/treatments")
    public ResponseEntity<List<TreatmentResponse>> getTreatments() {
        try {
            Long doctorId = getCurrentDoctorId();
            List<TreatmentResponse> treatments = treatmentService.getTreatmentsByDoctorId(doctorId);
            return ResponseEntity.ok(treatments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/treatments/{id}")
    public ResponseEntity<TreatmentResponse> getTreatmentById(@PathVariable Long id) {
        try {
            TreatmentResponse treatment = treatmentService.getTreatmentById(id);
            Long doctorId = getCurrentDoctorId();
            
            // Verify the treatment belongs to this doctor
            if (!treatment.getDoctorId().equals(doctorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            return ResponseEntity.ok(treatment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/treatments")
    public ResponseEntity<TreatmentResponse> createTreatment(@Valid @RequestBody CreateTreatmentRequest request) {
        try {
            Long doctorId = getCurrentDoctorId();
            TreatmentResponse treatment = treatmentService.createTreatment(doctorId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(treatment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/treatments/{id}")
    public ResponseEntity<TreatmentResponse> updateTreatment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTreatmentRequest request) {
        try {
            TreatmentResponse treatment = treatmentService.getTreatmentById(id);
            Long doctorId = getCurrentDoctorId();
            
            // Verify the treatment belongs to this doctor
            if (!treatment.getDoctorId().equals(doctorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            TreatmentResponse updated = treatmentService.updateTreatment(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/treatments/{id}")
    public ResponseEntity<Void> deleteTreatment(@PathVariable Long id) {
        try {
            TreatmentResponse treatment = treatmentService.getTreatmentById(id);
            Long doctorId = getCurrentDoctorId();
            
            // Verify the treatment belongs to this doctor
            if (!treatment.getDoctorId().equals(doctorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            treatmentService.deleteTreatment(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== Patient Management ==========

    @GetMapping("/patients")
    public ResponseEntity<List<PatientResponse>> searchPatients(
            @RequestParam(required = false) String search) {
        List<PatientResponse> patients = patientService.searchPatients(search);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable Long id) {
        try {
            PatientResponse patient = patientService.getPatientById(id);
            return ResponseEntity.ok(patient);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/patients/{id}/treatments")
    public ResponseEntity<List<TreatmentResponse>> getPatientTreatments(@PathVariable Long id) {
        try {
            // Verify patient exists
            patientService.getPatientById(id);
            
            List<TreatmentResponse> treatments = treatmentService.getTreatmentsByPatientId(id)
                    .stream()
                    .filter(t -> t.getDoctorId().equals(getCurrentDoctorId()))
                    .toList();
            return ResponseEntity.ok(treatments);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== Helper Methods ==========

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user.getId();
    }

    private Long getCurrentDoctorId() {
        Long userId = getCurrentUserId();
        DoctorResponse doctor = doctorService.getDoctorByUserId(userId);
        return doctor.getId();
    }
}

