package com.doctorbooking.backend.dto.response;

import com.doctorbooking.backend.model.Feedback;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long appointmentId;
    private String doctorName;
    private Integer rating;
    private String comment;
    private String status;
    private String adminReply;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FeedbackResponse fromEntity(Feedback feedback) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setPatientId(feedback.getPatient().getId());
        response.setPatientName(feedback.getPatient().getFullName());
        response.setAppointmentId(feedback.getAppointment() != null ? feedback.getAppointment().getId() : null);
        
        // Safely get doctor name from appointment
        String doctorName = null;
        if (feedback.getAppointment() != null && feedback.getAppointment().getDoctor() != null) {
            doctorName = feedback.getAppointment().getDoctor().getFullName();
        }
        response.setDoctorName(doctorName);
        
        response.setRating(feedback.getRating());
        response.setComment(feedback.getComment());
        response.setStatus(feedback.getStatus().name());
        response.setAdminReply(feedback.getAdminReply());
        response.setRepliedAt(feedback.getRepliedAt());
        response.setCreatedAt(feedback.getCreatedAt());
        response.setUpdatedAt(feedback.getUpdatedAt());
        return response;
    }
}

