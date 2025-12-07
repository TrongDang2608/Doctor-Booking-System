package com.doctorbooking.backend.controller;

import com.doctorbooking.backend.dto.response.NotificationResponse;
import com.doctorbooking.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;
    private final com.doctorbooking.backend.repository.PatientRepository patientRepository;

    /**
     * Lấy ID của patient hiện tại từ JWT token
     */
    private Long getCurrentPatientId() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            throw new RuntimeException("User not authenticated");
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        
        return patientRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Patient not found"))
                .getId();
    }

    /**
     * Lấy tất cả thông báo của patient
     */
    @GetMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getNotifications() {
        try {
            Long patientId = getCurrentPatientId();
            List<com.doctorbooking.backend.model.Notification> notifications = 
                notificationService.getNotificationsByPatientId(patientId);
            
            List<NotificationResponse> response = notifications.stream()
                    .map(NotificationResponse::fromEntity)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting notifications", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    @GetMapping("/unread-count")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> getUnreadCount() {
        try {
            Long patientId = getCurrentPatientId();
            long count = notificationService.getUnreadCount(patientId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("unreadCount", count);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting unread count", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Đánh dấu thông báo là đã đọc
     */
    @PutMapping("/{notificationId}/read")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId) {
        try {
            Long patientId = getCurrentPatientId();
            notificationService.markAsRead(notificationId, patientId);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (RuntimeException e) {
            logger.error("Error marking notification as read", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @PutMapping("/mark-all-read")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> markAllAsRead() {
        try {
            Long patientId = getCurrentPatientId();
            notificationService.markAllAsRead(patientId);
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            logger.error("Error marking all notifications as read", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xóa thông báo
     */
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> deleteNotification(@PathVariable Long notificationId) {
        try {
            Long patientId = getCurrentPatientId();
            notificationService.deleteNotification(notificationId, patientId);
            return ResponseEntity.ok(Map.of("message", "Notification deleted"));
        } catch (RuntimeException e) {
            logger.error("Error deleting notification", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

