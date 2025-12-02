package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.request.AdminUpdatePatientRequest;
import com.doctorbooking.backend.dto.request.DoctorRequest;
import com.doctorbooking.backend.dto.request.PatientRequest;
import com.doctorbooking.backend.dto.response.*;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.model.User;
import com.doctorbooking.backend.repository.PatientRepository;
import com.doctorbooking.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DoctorService doctorService;
    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final FeedbackService feedbackService;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Doctor Management
    public List<DoctorResponse> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    public List<DoctorResponse> searchDoctors(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllDoctors();
        }
        return doctorService.searchDoctors(keyword);
    }

    public DoctorResponse getDoctorById(Long id) {
        return doctorService.getDoctorById(id);
    }

    public DoctorResponse createDoctor(DoctorRequest request) {
        return doctorService.createDoctor(request);
    }

    public DoctorResponse updateDoctor(Long id, DoctorRequest request) {
        return doctorService.updateDoctor(id, request);
    }

    public void deleteDoctor(Long id) {
        doctorService.deleteDoctor(id);
    }

    // Patient Management
    public List<PatientResponse> searchPatients(String keyword) {
        return patientService.searchPatients(keyword);
    }

    public PatientResponse getPatientById(Long id) {
        return patientService.getPatientById(id);
    }

    @Transactional
    public PatientResponse createPatient(PatientRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.PATIENT);
        user.setEnabled(true);
        User savedUser = userRepository.save(user);

        // Create Patient
        Patient patient = new Patient();
        patient.setUser(savedUser);
        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setEmergencyPhone(request.getEmergencyPhone());
        Patient savedPatient = patientRepository.save(patient);

        return patientService.getPatientById(savedPatient.getId());
    }

    @Transactional
    public PatientResponse updatePatient(Long id, AdminUpdatePatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        // Update User email if changed
        User user = patient.getUser();
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
            userRepository.save(user);
        }

        // Update Patient info
        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setEmergencyPhone(request.getEmergencyPhone());
        Patient updatedPatient = patientRepository.save(patient);

        return patientService.getPatientById(updatedPatient.getId());
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
        User user = patient.getUser();
        patientRepository.delete(patient);
        userRepository.delete(user);
    }

    // Appointment Management
    public List<AppointmentResponse> getAllAppointments(LocalDate date) {
        if (date != null) {
            return appointmentService.getAppointmentsByDate(date);
        }
        return appointmentService.getAllAppointments();
    }

    public AppointmentResponse getAppointmentById(Long id) {
        return appointmentService.getAppointmentById(id);
    }

    // Feedback Management
    public List<FeedbackResponse> getAllFeedbacks(String status) {
        return feedbackService.getFeedbacksByStatus(status);
    }

    public FeedbackResponse getFeedbackById(Long id) {
        return feedbackService.getFeedbackById(id);
    }

    public FeedbackResponse markFeedbackAsRead(Long id) {
        return feedbackService.markFeedbackAsRead(id);
    }
}

