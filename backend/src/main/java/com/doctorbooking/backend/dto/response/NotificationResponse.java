package com.doctorbooking.backend.dto.response;

import com.doctorbooking.backend.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private Long appointmentId;
    private LocalDateTime createdAt;
    private String timeAgo; // "2 giờ trước", "1 ngày trước", etc.

    public static NotificationResponse fromEntity(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType().name());
        response.setIsRead(notification.getIsRead());
        response.setAppointmentId(notification.getAppointmentId());
        response.setCreatedAt(notification.getCreatedAt());
        response.setTimeAgo(calculateTimeAgo(notification.getCreatedAt()));
        return response;
    }

    private static String calculateTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "Vừa xong";
        }

        java.time.Duration duration = java.time.Duration.between(createdAt, LocalDateTime.now());
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();

        if (minutes < 1) {
            return "Vừa xong";
        } else if (minutes < 60) {
            return minutes + " phút trước";
        } else if (hours < 24) {
            return hours + " giờ trước";
        } else if (days < 7) {
            return days + " ngày trước";
        } else {
            return createdAt.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }
    }
}

