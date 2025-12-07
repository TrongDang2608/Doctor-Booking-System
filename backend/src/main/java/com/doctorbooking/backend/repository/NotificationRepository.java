package com.doctorbooking.backend.repository;

import com.doctorbooking.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Tìm tất cả thông báo của một patient, sắp xếp theo thời gian mới nhất
     */
    @Query("SELECT n FROM Notification n WHERE n.patient.id = :patientId ORDER BY n.createdAt DESC")
    List<Notification> findByPatientIdOrderByCreatedAtDesc(@Param("patientId") Long patientId);

    /**
     * Đếm số thông báo chưa đọc của một patient
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.patient.id = :patientId AND n.isRead = false")
    long countUnreadByPatientId(@Param("patientId") Long patientId);

    /**
     * Tìm thông báo chưa đọc của một patient
     */
    @Query("SELECT n FROM Notification n WHERE n.patient.id = :patientId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByPatientIdOrderByCreatedAtDesc(@Param("patientId") Long patientId);
}

