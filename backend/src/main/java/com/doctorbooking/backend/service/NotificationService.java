package com.doctorbooking.backend.service;

import com.doctorbooking.backend.model.Notification;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.repository.NotificationRepository;
import com.doctorbooking.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final PatientRepository patientRepository;

    /**
     * Tạo thông báo mới
     */
    @Transactional
    public Notification createNotification(
            Long patientId,
            String title,
            String message,
            Notification.NotificationType type,
            Long appointmentId) {
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        Notification notification = new Notification();
        notification.setPatient(patient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setAppointmentId(appointmentId);
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);
        logger.info("✅ Notification created: ID={}, Type={}, PatientID={}", saved.getId(), type, patientId);
        
        return saved;
    }

    /**
     * Lấy tất cả thông báo của patient
     */
    public List<Notification> getNotificationsByPatientId(Long patientId) {
        return notificationRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    /**
     * Đếm số thông báo chưa đọc
     */
    public long getUnreadCount(Long patientId) {
        return notificationRepository.countUnreadByPatientId(patientId);
    }

    /**
     * Đánh dấu thông báo là đã đọc
     */
    @Transactional
    public void markAsRead(Long notificationId, Long patientId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Verify ownership
        if (!notification.getPatient().getId().equals(patientId)) {
            throw new RuntimeException("Notification does not belong to this patient");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
        logger.info("✅ Notification marked as read: ID={}", notificationId);
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @Transactional
    public void markAllAsRead(Long patientId) {
        List<Notification> unreadNotifications = notificationRepository.findUnreadByPatientIdOrderByCreatedAtDesc(patientId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
        logger.info("✅ All notifications marked as read for patient: {}", patientId);
    }

    /**
     * Xóa thông báo
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long patientId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Verify ownership
        if (!notification.getPatient().getId().equals(patientId)) {
            throw new RuntimeException("Notification does not belong to this patient");
        }

        notificationRepository.delete(notification);
        logger.info("✅ Notification deleted: ID={}", notificationId);
    }
}

