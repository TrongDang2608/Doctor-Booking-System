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
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private Integer rating;
    private String comment;
    private String status;
    private String doctorReply;
    private LocalDateTime doctorRepliedAt;
    private Boolean isHidden;
    private Boolean canEdit; // Can patient edit this feedback?
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FeedbackResponse fromEntity(Feedback feedback) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setPatientId(feedback.getPatient().getId());
        response.setPatientName(feedback.getPatient().getFullName());
        response.setDoctorId(feedback.getDoctor().getId());
        response.setDoctorName(feedback.getDoctor().getFullName());
        response.setAppointmentId(feedback.getAppointment().getId());
        response.setRating(feedback.getRating());
        response.setComment(feedback.getComment());
        response.setStatus(feedback.getStatus().name());
        response.setDoctorReply(feedback.getDoctorReply());
        response.setDoctorRepliedAt(feedback.getDoctorRepliedAt());
        response.setIsHidden(feedback.getIsHidden());
        
        // Can edit if created within 24 hours and no doctor reply yet
        boolean canEdit = feedback.getDoctorReply() == null && 
                         feedback.getCreatedAt().plusHours(24).isAfter(LocalDateTime.now());
        response.setCanEdit(canEdit);
        
        response.setCreatedAt(feedback.getCreatedAt());
        response.setUpdatedAt(feedback.getUpdatedAt());
        return response;
    }
}

