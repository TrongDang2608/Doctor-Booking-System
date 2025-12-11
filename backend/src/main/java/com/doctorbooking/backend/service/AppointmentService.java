package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.request.CreateAppointmentRequest;
import com.doctorbooking.backend.dto.response.AppointmentResponse;
import com.doctorbooking.backend.model.Appointment;
import com.doctorbooking.backend.model.Doctor;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.repository.AppointmentRepository;
import com.doctorbooking.backend.repository.DoctorRepository;
import com.doctorbooking.backend.repository.PatientRepository;
import com.doctorbooking.backend.repository.FamilyAppointmentRepository;
import com.doctorbooking.backend.repository.FamilyMemberRepository;
import com.doctorbooking.backend.model.FamilyAppointment;
import com.doctorbooking.backend.model.FamilyMember;
import com.doctorbooking.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);
    
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final WalletService walletService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final jakarta.persistence.EntityManager entityManager;
    private final FamilyAppointmentRepository familyAppointmentRepository;
    private final FamilyMemberRepository familyMemberRepository;

    public List<AppointmentResponse> getAllAppointments() {
        // Use custom query to fetch all with relationships
        return appointmentRepository.findAll().stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsByDate(LocalDate date) {
        if (date == null) {
            return getAllAppointments();
        }
        return appointmentRepository.findByAppointmentDate(date).stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách time slots available của bác sĩ trong ngày
     * CHỈ tính các appointments PENDING hoặc CONFIRMED (không tính CANCELLED và COMPLETED)
     */
    public List<String> getAvailableTimeSlots(Long doctorId, LocalDate date) {
        // Danh sách tất cả time slots trong ngày
        List<String> allSlots = List.of(
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
            "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
            "15:00", "15:30", "16:00", "16:30", "17:00"
        );

        // Lấy các appointments của bác sĩ trong ngày
        List<Appointment> appointments = appointmentRepository.findByDoctorAndDate(doctorId, date);

        // Chỉ tính các slot đã book và CHƯA HOÀN THÀNH/HỦY
        List<String> bookedTimes = appointments.stream()
            .filter(apt -> apt.getStatus() == Appointment.AppointmentStatus.PENDING 
                        || apt.getStatus() == Appointment.AppointmentStatus.CONFIRMED)
            .map(apt -> {
                String time = apt.getAppointmentTime().toString();
                return time.length() > 5 ? time.substring(0, 5) : time; // HH:mm
            })
            .collect(Collectors.toList());

        // Trả về slots available (chưa bị book hoặc đã CANCELLED/COMPLETED)
        return allSlots.stream()
            .filter(slot -> !bookedTimes.contains(slot))
            .collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        return AppointmentResponse.fromEntity(appointment);
    }

    // Patient Appointment Booking
    @Transactional
    public AppointmentResponse createAppointment(Long patientId, CreateAppointmentRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + request.getDoctorId()));

        // Check if doctor is active
        if (doctor.getStatus() != Doctor.DoctorStatus.ACTIVE) {
            throw new RuntimeException("Doctor is not active");
        }

        // Check if appointment slot is already taken
        // CHỈ check các appointment PENDING hoặc CONFIRMED (không tính CANCELLED và COMPLETED)
        List<Appointment> existingAppointments = appointmentRepository.findByDoctorAndDate(
                request.getDoctorId(),
                request.getAppointmentDate()
        );

        boolean slotTaken = existingAppointments.stream()
                .anyMatch(apt -> 
                    apt.getAppointmentTime().equals(request.getAppointmentTime()) &&
                    (apt.getStatus() == Appointment.AppointmentStatus.PENDING || 
                     apt.getStatus() == Appointment.AppointmentStatus.CONFIRMED)
                );

        if (slotTaken) {
            throw new RuntimeException("Appointment slot is already taken");
        }
        
        // Nếu có appointment cũ ở slot này đã CANCELLED hoặc COMPLETED, DELETE nó để tránh duplicate constraint
        List<Appointment> oldAppointments = existingAppointments.stream()
                .filter(apt -> apt.getAppointmentTime().equals(request.getAppointmentTime()) &&
                              (apt.getStatus() == Appointment.AppointmentStatus.CANCELLED || 
                               apt.getStatus() == Appointment.AppointmentStatus.COMPLETED))
                .collect(Collectors.toList());
        
        if (!oldAppointments.isEmpty()) {
            for (Appointment apt : oldAppointments) {
                logger.info("Deleting old appointment (status={}) to reuse slot: appointmentId={}", apt.getStatus(), apt.getId());
                appointmentRepository.delete(apt);
            }
            // QUAN TRỌNG: Flush để đảm bảo DELETE được commit trước khi INSERT
            entityManager.flush();
            logger.info("Flushed entity manager after deleting old appointments");
        }

        // Check if date is not in the past
        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot book appointment in the past");
        }

        // Get consultation fee
        java.math.BigDecimal consultationFee = doctor.getConsultationFee() != null ? 
                doctor.getConsultationFee() : java.math.BigDecimal.ZERO;

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setStatus(Appointment.AppointmentStatus.PENDING);
        appointment.setNotes(request.getNotes());
        appointment.setPrice(consultationFee);
        
        // Xử lý payment method
        String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH";
        appointment.setPaymentMethod(paymentMethod);
        
        // Xử lý thanh toán theo phương thức
        if ("WALLET".equals(paymentMethod)) {
            // Thanh toán bằng ví: Trừ tiền ngay
            if (consultationFee.compareTo(java.math.BigDecimal.ZERO) > 0) {
                try {
                    // Save appointment first to get ID
                    appointment.setPaymentStatus(Appointment.PaymentStatus.PENDING);
                    appointment = appointmentRepository.save(appointment);
                    
                    // Process wallet payment
                    walletService.payForAppointment(
                        patientId, 
                        appointment.getId(), 
                        consultationFee, 
                        "Thanh toán phí khám bệnh - Dr. " + doctor.getFullName()
                    );
                    
                    // Update payment status to PAID
                    appointment.setPaymentStatus(Appointment.PaymentStatus.PAID);
                    appointment = appointmentRepository.save(appointment);
                } catch (Exception e) {
                    throw new RuntimeException("Payment failed: " + e.getMessage());
                }
            } else {
                // Miễn phí
                appointment.setPaymentStatus(Appointment.PaymentStatus.PAID);
                appointment = appointmentRepository.save(appointment);
            }
        } else if ("VNPAY".equals(paymentMethod)) {
            // VNPAY: Save appointment với PENDING, Frontend sẽ redirect sang VNPAY
            appointment.setPaymentStatus(Appointment.PaymentStatus.PENDING);
            appointment = appointmentRepository.save(appointment);
            // Note: Payment URL sẽ được tạo ở controller layer
        } else {
            // CASH: Payment status = PENDING
            appointment.setPaymentStatus(Appointment.PaymentStatus.PENDING);
            appointment = appointmentRepository.save(appointment);
        }
        
        // Nếu đặt lịch cho người nhà (có familyMemberId), tạo record trong family_appointments
        if (request.getFamilyMemberId() != null) {
            try {
                // Verify family member belongs to this patient
                FamilyMember familyMember = familyMemberRepository.findByIdAndMainPatientId(
                    request.getFamilyMemberId(), 
                    patientId
                );
                
                if (familyMember == null) {
                    logger.warn("Family member not found or does not belong to patient: familyMemberId={}, patientId={}", 
                               request.getFamilyMemberId(), patientId);
                    throw new RuntimeException("Family member not found or does not belong to you");
                }
                
                // Tạo FamilyAppointment record
                FamilyAppointment familyAppointment = new FamilyAppointment();
                familyAppointment.setFamilyMember(familyMember);
                familyAppointment.setAppointment(appointment);
                familyAppointment.setBookedByPatient(patient);
                
                familyAppointmentRepository.save(familyAppointment);
                
                logger.info("Created family appointment: appointmentId={}, familyMemberId={}, bookedByPatientId={}", 
                           appointment.getId(), familyMember.getId(), patientId);
            } catch (Exception e) {
                logger.error("Error creating family appointment: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to create family appointment: " + e.getMessage());
            }
        }
        
        // Lấy thông tin family member nếu đặt cho người nhà (dùng cho cả email và notification)
        String familyMemberName = null;
        String familyMemberRelationship = null;
        if (request.getFamilyMemberId() != null) {
            try {
                FamilyMember familyMember = familyMemberRepository.findByIdAndMainPatientId(
                    request.getFamilyMemberId(), 
                    patientId
                );
                if (familyMember != null) {
                    familyMemberName = familyMember.getFullName();
                    familyMemberRelationship = familyMember.getRelationship() != null 
                        ? familyMember.getRelationship().name() 
                        : null;
                }
            } catch (Exception e) {
                logger.warn("Could not load family member for notification: {}", e.getMessage());
            }
        }
        
        // Gửi email xác nhận đặt lịch thành công (lấy tất cả dữ liệu từ database)
        try {
            String patientEmail = patient.getUser().getEmail();
            if (patientEmail != null && !patientEmail.trim().isEmpty()) {
                // Format giá tiền
                String priceFormatted = consultationFee != null && consultationFee.compareTo(java.math.BigDecimal.ZERO) > 0
                    ? String.format("%,d", consultationFee.longValue())
                    : "Miễn phí";
                
                // Lấy payment status từ appointment
                String paymentStatus = appointment.getPaymentStatus() != null 
                    ? appointment.getPaymentStatus().name() 
                    : "PENDING";
                
                // Gửi email với tất cả dữ liệu từ database
                emailService.sendAppointmentConfirmationEmail(
                    patientEmail,                                    // Email người nhận
                    patient.getFullName(),                           // Tên người đặt lịch
                    patient.getPhone() != null ? patient.getPhone() : "", // SĐT người đặt lịch
                    doctor.getFullName(),                            // Tên bác sĩ
                    doctor.getSpecialization(),                      // Chuyên khoa
                    doctor.getPhone() != null ? doctor.getPhone() : "", // SĐT bác sĩ
                    doctor.getAddress() != null ? doctor.getAddress() : "", // Địa chỉ bác sĩ
                    appointment.getAppointmentDate(),                // Ngày khám
                    appointment.getAppointmentTime(),                // Giờ khám
                    String.valueOf(appointment.getId()),            // Mã lịch hẹn
                    appointment.getPaymentMethod() != null ? appointment.getPaymentMethod() : "CASH", // Phương thức thanh toán
                    paymentStatus,                                   // Trạng thái thanh toán
                    priceFormatted,                                  // Phí khám
                    appointment.getNotes(),                          // Ghi chú
                    familyMemberName,                                // Tên người nhà (nếu có)
                    familyMemberRelationship                         // Quan hệ (nếu có)
                );
                logger.info("Appointment confirmation email sent to patient: {} (Appointment ID: {})", patientEmail, appointment.getId());
            } else {
                logger.warn("Patient email is null or empty, skipping email notification for appointment: {}", appointment.getId());
            }
        } catch (Exception e) {
            // Log error nhưng không throw exception để không làm gián đoạn quá trình đặt lịch
            logger.error("Failed to send appointment confirmation email for appointment: {}", appointment.getId(), e);
        }
        
        // Tạo thông báo trong hệ thống (ngoài email)
        try {
            String notificationTitle = "Đặt lịch khám thành công";
            String notificationMessage;
            
            if (familyMemberName != null && !familyMemberName.trim().isEmpty()) {
                notificationMessage = String.format(
                    "Bạn đã đặt lịch khám thành công cho %s với Bác sĩ %s vào %s lúc %s",
                    familyMemberName,
                    doctor.getFullName(),
                    appointment.getAppointmentDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    appointment.getAppointmentTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
                );
            } else {
                notificationMessage = String.format(
                    "Bạn đã đặt lịch khám thành công với Bác sĩ %s vào %s lúc %s",
                    doctor.getFullName(),
                    appointment.getAppointmentDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    appointment.getAppointmentTime().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm"))
                );
            }
            
            notificationService.createNotification(
                patientId,
                notificationTitle,
                notificationMessage,
                com.doctorbooking.backend.model.Notification.NotificationType.APPOINTMENT_CONFIRMED,
                appointment.getId()
            );
            logger.info("✅ Notification created for appointment ID: {}", appointment.getId());
        } catch (Exception e) {
            // Log error nhưng không throw exception để không làm gián đoạn quá trình đặt lịch
            logger.error("Failed to create notification for appointment: {}", appointment.getId(), e);
        }
        
        return AppointmentResponse.fromEntity(appointment);
    }

    /**
     * Cập nhật payment status của appointment
     */
    @Transactional
    public void updatePaymentStatus(Long appointmentId, Appointment.PaymentStatus paymentStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setPaymentStatus(paymentStatus);
        appointmentRepository.save(appointment);
    }

    /**
     * Hủy appointment khi thanh toán thất bại
     */
    @Transactional
    public void cancelAppointmentDueToPaymentFailure(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setPaymentStatus(Appointment.PaymentStatus.UNPAID);
        appointmentRepository.save(appointment);
    }

    public List<AppointmentResponse> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByDateDesc(patientId).stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelAppointment(Long appointmentId, Long patientId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        // Verify the appointment belongs to this patient
        if (!appointment.getPatient().getId().equals(patientId)) {
            throw new RuntimeException("Appointment does not belong to this patient");
        }

        // Check if appointment can be cancelled
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed appointment");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled");
        }

        // Xử lý hoàn tiền nếu đã thanh toán bằng WALLET
        if ("WALLET".equals(appointment.getPaymentMethod()) && 
            appointment.getPaymentStatus() == Appointment.PaymentStatus.PAID &&
            appointment.getPrice() != null && 
            appointment.getPrice().compareTo(java.math.BigDecimal.ZERO) > 0) {
            
            logger.info("Processing refund for cancelled appointment: appointmentId={}, amount={}", 
                        appointmentId, appointment.getPrice());
            
            try {
                String refundDescription = String.format(
                    "Hoàn tiền hủy lịch khám - Dr. %s (Ngày: %s, Giờ: %s)",
                    appointment.getDoctor().getFullName(),
                    appointment.getAppointmentDate(),
                    appointment.getAppointmentTime()
                );
                
                walletService.refundAppointment(
                    patientId,
                    appointmentId,
                    appointment.getPrice(),
                    refundDescription
                );
                
                // Cập nhật payment status thành REFUNDED
                appointment.setPaymentStatus(Appointment.PaymentStatus.REFUNDED);
                logger.info("Refund processed successfully for appointment: {}", appointmentId);
            } catch (Exception e) {
                logger.error("Error processing refund for appointment: {}", appointmentId, e);
                throw new RuntimeException("Failed to process refund: " + e.getMessage());
            }
        }

        // Cập nhật status thành CANCELLED
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        logger.info("Appointment cancelled successfully: appointmentId={}", appointmentId);
    }

    // Doctor confirms appointment (PENDING -> CONFIRMED)
    @Transactional
    public AppointmentResponse confirmAppointment(Long appointmentId, Long doctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        // Verify the appointment belongs to this doctor
        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Appointment does not belong to this doctor");
        }

        // Check if appointment can be confirmed
        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException("Only PENDING appointments can be confirmed");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        appointment = appointmentRepository.save(appointment);
        
        // Send confirmation email to patient
        try {
            sendConfirmationEmail(appointment);
            logger.info("✅ Confirmation email sent for appointment ID: {}", appointmentId);
        } catch (Exception e) {
            logger.error("❌ Failed to send confirmation email for appointment ID: {}", appointmentId, e);
            // Don't throw - email failure shouldn't block confirmation
        }
        
        return AppointmentResponse.fromEntity(appointment);
    }

    // Mark appointment as completed (when treatment is created)
    @Transactional
    public void completeAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        // Only CONFIRMED appointments can be completed
        if (appointment.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Only CONFIRMED appointments can be completed");
        }

        appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
    }

    // Admin methods
    @Transactional
    public AppointmentResponse updateAppointmentByAdmin(Long id, com.doctorbooking.backend.dto.request.UpdateAppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

        Appointment.AppointmentStatus oldStatus = appointment.getStatus();
        boolean statusChangedToConfirmed = false;
        
        if (request.getStatus() != null) {
            appointment.setStatus(request.getStatus());
            // Check if status changed from PENDING to CONFIRMED
            if (oldStatus == Appointment.AppointmentStatus.PENDING && 
                request.getStatus() == Appointment.AppointmentStatus.CONFIRMED) {
                statusChangedToConfirmed = true;
            }
        }
        if (request.getAppointmentDate() != null) {
            appointment.setAppointmentDate(request.getAppointmentDate());
        }
        if (request.getAppointmentTime() != null) {
            appointment.setAppointmentTime(request.getAppointmentTime());
        }
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }

        Appointment updated = appointmentRepository.save(appointment);
        
        // Send confirmation email if status changed to CONFIRMED
        if (statusChangedToConfirmed) {
            try {
                sendConfirmationEmail(updated);
                logger.info("✅ Confirmation email sent by admin for appointment ID: {}", id);
            } catch (Exception e) {
                logger.error("❌ Failed to send confirmation email for appointment ID: {}", id, e);
                // Don't throw - email failure shouldn't block update
            }
        }
        
        return AppointmentResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        appointmentRepository.delete(appointment);
    }
    
    /**
     * Helper method to send confirmation email when appointment is confirmed
     */
    private void sendConfirmationEmail(Appointment appointment) {
        try {
            Patient patient = appointment.getPatient();
            Doctor doctor = appointment.getDoctor();
            
            if (patient == null || doctor == null) {
                logger.warn("⚠️ Cannot send email - missing patient or doctor for appointment ID: {}", appointment.getId());
                return;
            }
            
            // Get patient email from User entity
            String patientEmail = null;
            if (patient.getUser() != null) {
                patientEmail = patient.getUser().getEmail();
            }
            
            if (patientEmail == null || patientEmail.trim().isEmpty()) {
                logger.warn("⚠️ Cannot send email - patient has no email for appointment ID: {}", appointment.getId());
                return;
            }
            
            // Get family member info if this is a family appointment
            String familyMemberName = null;
            String familyMemberRelationship = null;
            
            try {
                FamilyAppointment familyAppointment = familyAppointmentRepository
                    .findByAppointmentId(appointment.getId())
                    .orElse(null);
                
                if (familyAppointment != null && familyAppointment.getFamilyMember() != null) {
                    FamilyMember familyMember = familyAppointment.getFamilyMember();
                    familyMemberName = familyMember.getFullName();
                    familyMemberRelationship = familyMember.getRelationship() != null 
                        ? familyMember.getRelationship().toString() : null;
                }
            } catch (Exception e) {
                logger.warn("⚠️ Error getting family member info for appointment {}: {}", 
                    appointment.getId(), e.getMessage());
                // Continue without family member info
            }
            
            emailService.sendAppointmentConfirmationEmail(
                patientEmail,
                patient.getFullName() != null ? patient.getFullName() : "Bệnh nhân",
                patient.getPhone() != null ? patient.getPhone() : "",
                doctor.getFullName() != null ? doctor.getFullName() : "Bác sĩ",
                doctor.getSpecialization() != null ? doctor.getSpecialization() : "",
                doctor.getPhone() != null ? doctor.getPhone() : "",
                doctor.getAddress() != null ? doctor.getAddress() : "",
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getId().toString(),
                appointment.getPaymentMethod() != null ? appointment.getPaymentMethod().toString() : "Chưa xác định",
                appointment.getPaymentStatus() != null ? appointment.getPaymentStatus().toString() : "Chưa thanh toán",
                appointment.getPrice() != null ? appointment.getPrice().toString() : "0",
                appointment.getNotes() != null ? appointment.getNotes() : "",
                familyMemberName,
                familyMemberRelationship
            );
            
            logger.info("✅ Confirmation email sent successfully for appointment ID: {}", appointment.getId());
        } catch (Exception e) {
            logger.error("❌ Unexpected error sending confirmation email for appointment ID: {}", 
                appointment.getId(), e);
            throw e; // Re-throw to be caught by caller's try-catch
        }
    }

    // Doctor cancels appointment (with 24h constraint)
    @Transactional
    public void cancelAppointmentByDoctor(Long appointmentId, Long doctorId, String cancellationReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        // Verify the appointment belongs to this doctor
        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Appointment does not belong to this doctor");
        }

        // Check if appointment can be cancelled
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed appointment");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled");
        }

        // Only allow cancelling PENDING or CONFIRMED appointments
        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING && 
            appointment.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
            throw new RuntimeException("Can only cancel pending or confirmed appointments");
        }

        // Check 24 hours before appointment
        java.time.LocalDateTime appointmentDateTime = java.time.LocalDateTime.of(
            appointment.getAppointmentDate(),
            appointment.getAppointmentTime()
        );
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.Duration duration = java.time.Duration.between(now, appointmentDateTime);
        
        if (duration.toHours() < 24) {
            throw new RuntimeException("Cannot cancel appointment less than 24 hours before scheduled time");
        }

        // Process refund if paid by WALLET
        processRefundIfNeeded(appointment);

        // Update status and reason
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(cancellationReason);
        appointmentRepository.save(appointment);

        // Send notification email to patient
        try {
            String subject = "Lịch hẹn đã bị hủy - Doctor Booking System";
            String content = String.format(
                "Kính gửi %s,\n\n" +
                "Lịch hẹn của bạn đã bị hủy bởi bác sĩ.\n\n" +
                "Thông tin lịch hẹn:\n" +
                "- Bác sĩ: %s\n" +
                "- Ngày: %s\n" +
                "- Giờ: %s\n" +
                "- Lý do hủy: %s\n\n" +
                "Trân trọng,\n" +
                "Doctor Booking System",
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                cancellationReason
            );
            emailService.sendEmail(appointment.getPatient().getUser().getEmail(), subject, content);
        } catch (Exception e) {
            logger.error("Failed to send cancellation email to patient", e);
        }

        logger.info("Appointment cancelled by doctor: appointmentId={}, doctorId={}", appointmentId, doctorId);
    }

    // Admin cancels appointment (no time constraint)
    @Transactional
    public void cancelAppointmentByAdmin(Long appointmentId, String cancellationReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + appointmentId));

        // Check if appointment can be cancelled
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed appointment");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled");
        }

        // Process refund if paid by WALLET
        processRefundIfNeeded(appointment);

        // Update status and reason
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(cancellationReason);
        appointmentRepository.save(appointment);

        // Send notification email to patient
        try {
            String subject = "Lịch hẹn đã bị hủy - Doctor Booking System";
            String content = String.format(
                "Kính gửi %s,\n\n" +
                "Lịch hẹn của bạn đã bị hủy bởi quản trị viên.\n\n" +
                "Thông tin lịch hẹn:\n" +
                "- Bác sĩ: %s\n" +
                "- Ngày: %s\n" +
                "- Giờ: %s\n" +
                "- Lý do hủy: %s\n\n" +
                "Trân trọng,\n" +
                "Doctor Booking System",
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                cancellationReason
            );
            emailService.sendEmail(appointment.getPatient().getUser().getEmail(), subject, content);
        } catch (Exception e) {
            logger.error("Failed to send cancellation email to patient", e);
        }

        logger.info("Appointment cancelled by admin: appointmentId={}", appointmentId);
    }

    private void processRefundIfNeeded(Appointment appointment) {
        if ("WALLET".equals(appointment.getPaymentMethod()) && 
            appointment.getPaymentStatus() == Appointment.PaymentStatus.PAID &&
            appointment.getPrice() != null && 
            appointment.getPrice().compareTo(java.math.BigDecimal.ZERO) > 0) {
            
            logger.info("Processing refund for cancelled appointment: appointmentId={}, amount={}", 
                        appointment.getId(), appointment.getPrice());
            
            try {
                String refundDescription = String.format(
                    "Hoàn tiền hủy lịch khám - Dr. %s (Ngày: %s, Giờ: %s)",
                    appointment.getDoctor().getFullName(),
                    appointment.getAppointmentDate(),
                    appointment.getAppointmentTime()
                );
                
                walletService.refundAppointment(
                    appointment.getPatient().getId(),
                    appointment.getId(),
                    appointment.getPrice(),
                    refundDescription
                );
                
                appointment.setPaymentStatus(Appointment.PaymentStatus.REFUNDED);
                logger.info("Refund processed successfully for appointment: {}", appointment.getId());
            } catch (Exception e) {
                logger.error("Error processing refund for appointment: {}", appointment.getId(), e);
                throw new RuntimeException("Failed to process refund: " + e.getMessage());
            }
        }
    }
}




