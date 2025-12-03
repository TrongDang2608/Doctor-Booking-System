package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.request.CreateAppointmentRequest;
import com.doctorbooking.backend.dto.response.AppointmentResponse;
import com.doctorbooking.backend.model.Appointment;
import com.doctorbooking.backend.model.Doctor;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.repository.AppointmentRepository;
import com.doctorbooking.backend.repository.DoctorRepository;
import com.doctorbooking.backend.repository.PatientRepository;
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
    private final jakarta.persistence.EntityManager entityManager;

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
}

