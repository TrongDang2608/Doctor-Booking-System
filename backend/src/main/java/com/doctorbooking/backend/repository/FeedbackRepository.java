package com.doctorbooking.backend.repository;

import com.doctorbooking.backend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // Patient queries
    List<Feedback> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    Optional<Feedback> findByAppointmentId(Long appointmentId);
    
    // Doctor queries
    List<Feedback> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    List<Feedback> findByDoctorIdAndRatingOrderByCreatedAtDesc(Long doctorId, Integer rating);
    
    // Admin queries
    List<Feedback> findAllByOrderByCreatedAtDesc();
    List<Feedback> findByStatusOrderByCreatedAtDesc(Feedback.FeedbackStatus status);
}
