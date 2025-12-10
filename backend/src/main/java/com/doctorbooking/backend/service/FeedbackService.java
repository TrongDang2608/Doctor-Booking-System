package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.request.CreateFeedbackRequest;
import com.doctorbooking.backend.dto.response.FeedbackResponse;
import com.doctorbooking.backend.model.Appointment;
import com.doctorbooking.backend.model.Feedback;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.repository.AppointmentRepository;
import com.doctorbooking.backend.repository.FeedbackRepository;
import com.doctorbooking.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAll().stream()
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponse> getFeedbacksByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return getAllFeedbacks();
        }
        try {
            Feedback.FeedbackStatus feedbackStatus = Feedback.FeedbackStatus.valueOf(status.toUpperCase());
            return feedbackRepository.findByStatus(feedbackStatus).stream()
                    .map(FeedbackResponse::fromEntity)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return getAllFeedbacks();
        }
    }

    public FeedbackResponse getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
        return FeedbackResponse.fromEntity(feedback);
    }

    @Transactional
    @SuppressWarnings("null")
    public FeedbackResponse markFeedbackAsRead(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
        feedback.setStatus(Feedback.FeedbackStatus.READ);
        feedback = feedbackRepository.save(feedback);
        return FeedbackResponse.fromEntity(feedback);
    }

    // Patient Feedback Creation
    @Transactional
    public FeedbackResponse createFeedback(Long patientId, CreateFeedbackRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElse(null); // Appointment is optional
        }

        Feedback feedback = new Feedback();
        feedback.setPatient(patient);
        feedback.setAppointment(appointment);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setStatus(Feedback.FeedbackStatus.PENDING);

        feedback = feedbackRepository.save(feedback);
        return FeedbackResponse.fromEntity(feedback);
    }

    public List<FeedbackResponse> getPatientFeedbacks(Long patientId) {
        return feedbackRepository.findByPatientId(patientId).stream()
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    @SuppressWarnings("null")
    public FeedbackResponse replyFeedback(Long id, com.doctorbooking.backend.dto.request.ReplyFeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
        
        feedback.setAdminReply(request.getAdminReply());
        feedback.setStatus(Feedback.FeedbackStatus.REPLIED);
        feedback.setRepliedAt(java.time.LocalDateTime.now());
        
        feedback = feedbackRepository.save(feedback);
        return FeedbackResponse.fromEntity(feedback);
    }

    @Transactional
    @SuppressWarnings("null")
    public void deleteFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + id));
        feedbackRepository.delete(feedback);
    }
}

