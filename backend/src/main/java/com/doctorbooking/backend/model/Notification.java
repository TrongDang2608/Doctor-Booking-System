package com.doctorbooking.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(name = "appointment_id")
    private Long appointmentId; // ID của appointment liên quan (nếu có)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum NotificationType {
        APPOINTMENT_CONFIRMED,  // Đặt lịch thành công
        APPOINTMENT_REMINDER_24H, // Nhắc hẹn 24h
        APPOINTMENT_REMINDER_1H,  // Nhắc hẹn 1h
        APPOINTMENT_CANCELLED,    // Hủy lịch
        PAYMENT_SUCCESS,          // Thanh toán thành công
        WALLET_DEPOSIT_SUCCESS,  // Nạp tiền vào ví thành công
        OTHER                     // Khác
    }
}

