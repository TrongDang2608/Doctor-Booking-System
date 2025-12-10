package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.request.CreateFeedbackRequest;
import com.doctorbooking.backend.dto.request.UpdateFeedbackRequest;
import com.doctorbooking.backend.dto.request.ReplyFeedbackRequest;
import com.doctorbooking.backend.dto.response.FeedbackResponse;
import com.doctorbooking.backend.model.Appointment;
import com.doctorbooking.backend.model.Doctor;
import com.doctorbooking.backend.model.Feedback;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.repository.AppointmentRepository;
import com.doctorbooking.backend.repository.DoctorRepository;
import com.doctorbooking.backend.repository.FeedbackRepository;
import com.doctorbooking.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackService.class);
    private static final int EDIT_WINDOW_HOURS = 24;

    private final FeedbackRepository feedbackRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    // ========== PATIENT OPERATIONS ==========

    /**
     * Patient creates feedback for completed appointment
     */
    @Transactional
    public FeedbackResponse createFeedback(Long patientId, CreateFeedbackRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Verify appointment belongs to patient
        if (!appointment.getPatient().getId().equals(patientId)) {
            throw new RuntimeException("Appointment does not belong to this patient");
        }

        // Verify appointment is completed
        if (appointment.getStatus() != Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Can only create feedback for completed appointments");
        }

        // Check if feedback already exists for this appointment
        if (feedbackRepository.findByAppointmentId(appointment.getId()).isPresent()) {
            throw new RuntimeException("Feedback already exists for this appointment");
        }

        Feedback feedback = new Feedback();
        feedback.setPatient(patient);
        feedback.setDoctor(appointment.getDoctor());
        feedback.setAppointment(appointment);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setStatus(Feedback.FeedbackStatus.PENDING);
        feedback.setIsHidden(false);

        feedback = feedbackRepository.save(feedback);
        logger.info("✅ Feedback created by patient {} for appointment {}", patientId, appointment.getId());
        return FeedbackResponse.fromEntity(feedback);
    }

    /**
     * Patient updates their own feedback (within 24 hours, before doctor replies)
     */
    @Transactional
    public FeedbackResponse updateFeedback(Long patientId, Long feedbackId, UpdateFeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        // Verify feedback belongs to patient
        if (!feedback.getPatient().getId().equals(patientId)) {
            throw new RuntimeException("This feedback does not belong to you");
        }

        // Check if can edit (within 24 hours and no doctor reply)
        if (feedback.getDoctorReply() != null) {
            throw new RuntimeException("Cannot edit feedback after doctor has replied");
        }

        if (feedback.getCreatedAt().plusHours(EDIT_WINDOW_HOURS).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Feedback can only be edited within " + EDIT_WINDOW_HOURS + " hours");
        }

        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        feedback = feedbackRepository.save(feedback);
        logger.info("✅ Feedback {} updated by patient {}", feedbackId, patientId);
        return FeedbackResponse.fromEntity(feedback);
    }

    /**
     * Patient views their own feedbacks
     */
    public List<FeedbackResponse> getPatientFeedbacks(Long patientId) {
        return feedbackRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Patient views specific feedback
     */
    public FeedbackResponse getPatientFeedbackById(Long patientId, Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (!feedback.getPatient().getId().equals(patientId)) {
            throw new RuntimeException("This feedback does not belong to you");
        }

        return FeedbackResponse.fromEntity(feedback);
    }

    // ========== DOCTOR OPERATIONS ==========

    /**
     * Doctor views all feedbacks for themselves
     */
    public List<FeedbackResponse> getDoctorFeedbacks(Long doctorId) {
        return feedbackRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId).stream()
                .filter(feedback -> !feedback.getIsHidden()) // Hide hidden feedbacks
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Doctor views feedbacks filtered by rating
     */
    public List<FeedbackResponse> getDoctorFeedbacksByRating(Long doctorId, Integer rating) {
        return feedbackRepository.findByDoctorIdAndRatingOrderByCreatedAtDesc(doctorId, rating).stream()
                .filter(feedback -> !feedback.getIsHidden())
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Doctor views specific feedback
     */
    public FeedbackResponse getDoctorFeedbackById(Long doctorId, Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (!feedback.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("This feedback is not for you");
        }

        // Mark as READ if still PENDING
        if (feedback.getStatus() == Feedback.FeedbackStatus.PENDING) {
            feedback.setStatus(Feedback.FeedbackStatus.READ);
            feedback = feedbackRepository.save(feedback);
        }

        return FeedbackResponse.fromEntity(feedback);
    }

    /**
     * Doctor replies to feedback
     */
    @Transactional
    public FeedbackResponse replyToFeedback(Long doctorId, Long feedbackId, ReplyFeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (!feedback.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("This feedback is not for you");
        }

        feedback.setDoctorReply(request.getDoctorReply());
        feedback.setDoctorRepliedAt(LocalDateTime.now());
        feedback.setStatus(Feedback.FeedbackStatus.REPLIED);

        feedback = feedbackRepository.save(feedback);
        logger.info("✅ Doctor {} replied to feedback {}", doctorId, feedbackId);
        return FeedbackResponse.fromEntity(feedback);
    }

    /**
     * Doctor updates their reply (within 24 hours)
     */
    @Transactional
    public FeedbackResponse updateDoctorReply(Long doctorId, Long feedbackId, ReplyFeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        if (!feedback.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("This feedback is not for you");
        }

        if (feedback.getDoctorReply() == null) {
            throw new RuntimeException("No reply exists to update");
        }

        // Check if can edit (within 24 hours)
        if (feedback.getDoctorRepliedAt().plusHours(EDIT_WINDOW_HOURS).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reply can only be edited within " + EDIT_WINDOW_HOURS + " hours");
        }

        feedback.setDoctorReply(request.getDoctorReply());

        feedback = feedbackRepository.save(feedback);
        logger.info("✅ Doctor {} updated reply to feedback {}", doctorId, feedbackId);
        return FeedbackResponse.fromEntity(feedback);
    }

    /**
     * Get doctor's average rating
     */
    public Double getDoctorAverageRating(Long doctorId) {
        List<Feedback> feedbacks = feedbackRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        if (feedbacks.isEmpty()) {
            return 0.0;
        }
        double sum = feedbacks.stream()
                .filter(f -> !f.getIsHidden())
                .mapToInt(Feedback::getRating)
                .sum();
        long count = feedbacks.stream().filter(f -> !f.getIsHidden()).count();
        return count > 0 ? sum / count : 0.0;
    }

    // ========== ADMIN OPERATIONS ==========

    /**
     * Admin views all feedbacks (including hidden)
     */
    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Admin filters feedbacks by status
     */
    public List<FeedbackResponse> getFeedbacksByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return getAllFeedbacks();
        }
        try {
            Feedback.FeedbackStatus feedbackStatus = Feedback.FeedbackStatus.valueOf(status.toUpperCase());
            return feedbackRepository.findByStatusOrderByCreatedAtDesc(feedbackStatus).stream()
                    .map(FeedbackResponse::fromEntity)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return getAllFeedbacks();
        }
    }

    /**
     * Admin filters feedbacks by doctor
     */
    public List<FeedbackResponse> getFeedbacksByDoctor(Long doctorId) {
        return feedbackRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId).stream()
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Admin filters feedbacks by patient
     */
    public List<FeedbackResponse> getFeedbacksByPatient(Long patientId) {
        return feedbackRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Admin views specific feedback
     */
    public FeedbackResponse getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        
        // Mark as READ if still PENDING
        if (feedback.getStatus() == Feedback.FeedbackStatus.PENDING) {
            feedback.setStatus(Feedback.FeedbackStatus.READ);
            feedback = feedbackRepository.save(feedback);
        }
        
        return FeedbackResponse.fromEntity(feedback);
    }

    /**
     * Admin hides feedback (spam, inappropriate content)
     */
    @Transactional
    public FeedbackResponse hideFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        
        feedback.setIsHidden(true);
        feedback = feedbackRepository.save(feedback);
        logger.info("✅ Admin hid feedback {}", id);
        return FeedbackResponse.fromEntity(feedback);
    }

    /**
     * Admin unhides feedback
     */
    @Transactional
    public FeedbackResponse unhideFeedback(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        
        feedback.setIsHidden(false);
        feedback = feedbackRepository.save(feedback);
        logger.info("✅ Admin unhid feedback {}", id);
        return FeedbackResponse.fromEntity(feedback);
    }
}
