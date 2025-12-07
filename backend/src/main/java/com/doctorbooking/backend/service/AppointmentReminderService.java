package com.doctorbooking.backend.service;

import com.doctorbooking.backend.model.Appointment;
import com.doctorbooking.backend.model.FamilyAppointment;
import com.doctorbooking.backend.repository.AppointmentRepository;
import com.doctorbooking.backend.repository.FamilyAppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentReminderService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentReminderService.class);

    private final AppointmentRepository appointmentRepository;
    private final FamilyAppointmentRepository familyAppointmentRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    /**
     * Chạy mỗi 30 phút để kiểm tra và gửi nhắc hẹn 24 giờ
     */
    @Scheduled(fixedRate = 1800000) // 30 phút = 1800000 milliseconds
    @Transactional
    public void send24HourReminders() {
        try {
            LocalDate tomorrow = LocalDate.now().plusDays(1);
            List<Appointment> appointments = appointmentRepository.findAppointmentsFor24hReminder(tomorrow);

            if (appointments.isEmpty()) {
                logger.debug("No appointments found for 24h reminder on {}", tomorrow);
                return;
            }

            logger.info("Found {} appointments for 24h reminder on {}", appointments.size(), tomorrow);

            for (Appointment appointment : appointments) {
                try {
                    sendReminderEmail(appointment, 24);
                    // Đánh dấu đã gửi nhắc hẹn 24h
                    appointment.setReminder24hSent(true);
                    appointmentRepository.save(appointment);
                    logger.info("✅ 24h reminder sent for appointment ID: {}", appointment.getId());
                } catch (Exception e) {
                    logger.error("❌ Error sending 24h reminder for appointment ID: {}", appointment.getId(), e);
                }
            }
        } catch (Exception e) {
            logger.error("❌ Error in send24HourReminders scheduled task", e);
        }
    }

    /**
     * Chạy mỗi 15 phút để kiểm tra và gửi nhắc hẹn 1 giờ
     */
    @Scheduled(fixedRate = 900000) // 15 phút = 900000 milliseconds
    @Transactional
    public void send1HourReminders() {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDate today = now.toLocalDate();
            LocalTime oneHourLater = now.plusHours(1).toLocalTime();
            
            // Làm tròn xuống giờ gần nhất (ví dụ: 14:35 -> 14:00, 14:45 -> 14:00)
            LocalTime targetTime = LocalTime.of(oneHourLater.getHour(), 0);

            List<Appointment> appointments = appointmentRepository.findAppointmentsFor1hReminder(today, targetTime);

            if (appointments.isEmpty()) {
                logger.debug("No appointments found for 1h reminder at {} on {}", targetTime, today);
                return;
            }

            logger.info("Found {} appointments for 1h reminder at {} on {}", appointments.size(), targetTime, today);

            for (Appointment appointment : appointments) {
                try {
                    // Kiểm tra xem thời gian hiện tại có gần với thời gian hẹn không (trong khoảng 1h ± 15 phút)
                    LocalDateTime appointmentDateTime = LocalDateTime.of(
                        appointment.getAppointmentDate(),
                        appointment.getAppointmentTime()
                    );
                    long minutesUntilAppointment = java.time.Duration.between(now, appointmentDateTime).toMinutes();
                    
                    // Chỉ gửi nếu còn từ 45 đến 75 phút (1 giờ ± 15 phút)
                    if (minutesUntilAppointment >= 45 && minutesUntilAppointment <= 75) {
                        sendReminderEmail(appointment, 1);
                        // Đánh dấu đã gửi nhắc hẹn 1h
                        appointment.setReminder1hSent(true);
                        appointmentRepository.save(appointment);
                        logger.info("✅ 1h reminder sent for appointment ID: {}", appointment.getId());
                    } else {
                        logger.debug("Skipping appointment ID: {} - time difference: {} minutes (not in 45-75 range)", 
                                   appointment.getId(), minutesUntilAppointment);
                    }
                } catch (Exception e) {
                    logger.error("❌ Error sending 1h reminder for appointment ID: {}", appointment.getId(), e);
                }
            }
        } catch (Exception e) {
            logger.error("❌ Error in send1HourReminders scheduled task", e);
        }
    }

    /**
     * Gửi email nhắc hẹn cho appointment
     */
    private void sendReminderEmail(Appointment appointment, int hoursBefore) {
        try {
            String patientEmail = appointment.getPatient().getUser().getEmail();
            if (patientEmail == null || patientEmail.trim().isEmpty()) {
                logger.warn("⚠️ Patient email is null or empty for appointment ID: {}", appointment.getId());
                return;
            }

            // Lấy thông tin family member nếu đặt cho người nhà
            String familyMemberName = null;
            String familyMemberRelationship = null;
            
            FamilyAppointment familyAppointment = familyAppointmentRepository
                .findByAppointmentId(appointment.getId())
                .orElse(null);
            
            if (familyAppointment != null && familyAppointment.getFamilyMember() != null) {
                familyMemberName = familyAppointment.getFamilyMember().getFullName();
                if (familyAppointment.getFamilyMember().getRelationship() != null) {
                    familyMemberRelationship = familyAppointment.getFamilyMember().getRelationship().name();
                }
            }

            // Gửi email nhắc hẹn
            emailService.sendAppointmentReminderEmail(
                patientEmail,
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                appointment.getDoctor().getSpecialization(),
                appointment.getDoctor().getPhone() != null ? appointment.getDoctor().getPhone() : "",
                appointment.getDoctor().getAddress() != null ? appointment.getDoctor().getAddress() : "",
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                String.valueOf(appointment.getId()),
                hoursBefore,
                familyMemberName,
                familyMemberRelationship
            );

            logger.info("📧 Reminder email ({}h before) sent to: {} for appointment ID: {}", 
                       hoursBefore, patientEmail, appointment.getId());
            
            // Tạo thông báo trong hệ thống (ngoài email)
            try {
                String notificationTitle = String.format("Nhắc hẹn: Lịch khám còn %d giờ nữa", hoursBefore);
                String notificationMessage;
                
                if (familyMemberName != null && !familyMemberName.trim().isEmpty()) {
                    notificationMessage = String.format(
                        "Lịch khám của %s với Bác sĩ %s sẽ diễn ra sau %d giờ nữa (%s lúc %s). Vui lòng có mặt trước 15 phút.",
                        familyMemberName,
                        appointment.getDoctor().getFullName(),
                        hoursBefore,
                        appointment.getAppointmentDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                        appointment.getAppointmentTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
                    );
                } else {
                    notificationMessage = String.format(
                        "Lịch khám của bạn với Bác sĩ %s sẽ diễn ra sau %d giờ nữa (%s lúc %s). Vui lòng có mặt trước 15 phút.",
                        appointment.getDoctor().getFullName(),
                        hoursBefore,
                        appointment.getAppointmentDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                        appointment.getAppointmentTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
                    );
                }
                
                com.doctorbooking.backend.model.Notification.NotificationType notificationType = 
                    hoursBefore == 24 
                        ? com.doctorbooking.backend.model.Notification.NotificationType.APPOINTMENT_REMINDER_24H
                        : com.doctorbooking.backend.model.Notification.NotificationType.APPOINTMENT_REMINDER_1H;
                
                notificationService.createNotification(
                    appointment.getPatient().getId(),
                    notificationTitle,
                    notificationMessage,
                    notificationType,
                    appointment.getId()
                );
                logger.info("✅ Notification created for reminder ({}h before) - Appointment ID: {}", hoursBefore, appointment.getId());
            } catch (Exception e) {
                logger.error("❌ Error creating notification for reminder - Appointment ID: {}", appointment.getId(), e);
                // Không throw để không làm gián đoạn quá trình gửi email
            }
            
        } catch (Exception e) {
            logger.error("❌ Error sending reminder email for appointment ID: {}", appointment.getId(), e);
            throw e; // Re-throw để transaction có thể rollback nếu cần
        }
    }
}

