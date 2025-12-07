package com.doctorbooking.backend.repository;

import com.doctorbooking.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Use JOIN FETCH to eagerly load patient and doctor
    @Query("SELECT DISTINCT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.patient.id = :patientId")
    List<Appointment> findByPatientId(@Param("patientId") Long patientId);
    
    @Query("SELECT DISTINCT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.doctor.id = :doctorId")
    List<Appointment> findByDoctorId(@Param("doctorId") Long doctorId);
    
    @Query("SELECT DISTINCT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor")
    List<Appointment> findAll();
    
    @Query("SELECT DISTINCT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.id = :id")
    Optional<Appointment> findByIdWithRelations(@Param("id") Long id);
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.appointmentDate = :date")
    List<Appointment> findByAppointmentDate(@Param("date") LocalDate date);
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.doctor.id = :doctorId AND " +
           "a.appointmentDate = :date AND a.appointmentTime = :time AND " +
           "a.status != 'CANCELLED'")
    Optional<Appointment> findExistingAppointment(
        @Param("doctorId") Long doctorId,
        @Param("date") LocalDate date,
        @Param("time") LocalTime time
    );
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.doctor.id = :doctorId AND " +
           "a.appointmentDate = :date")
    List<Appointment> findByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
    
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.patient.id = :patientId ORDER BY a.appointmentDate DESC, a.appointmentTime DESC")
    List<Appointment> findByPatientIdOrderByDateDesc(@Param("patientId") Long patientId);
    
    /**
     * Tìm các appointments sắp tới cần gửi nhắc hẹn
     * Status: PENDING hoặc CONFIRMED
     * Chưa gửi nhắc hẹn 24h
     */
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient p JOIN FETCH p.user JOIN FETCH a.doctor " +
           "WHERE a.status IN ('PENDING', 'CONFIRMED') " +
           "AND a.reminder24hSent = false " +
           "AND a.appointmentDate = :targetDate")
    List<Appointment> findAppointmentsFor24hReminder(@Param("targetDate") java.time.LocalDate targetDate);
    
    /**
     * Tìm các appointments sắp tới cần gửi nhắc hẹn 1h
     * Status: PENDING hoặc CONFIRMED
     * Chưa gửi nhắc hẹn 1h
     */
    @Query("SELECT a FROM Appointment a JOIN FETCH a.patient p JOIN FETCH p.user JOIN FETCH a.doctor " +
           "WHERE a.status IN ('PENDING', 'CONFIRMED') " +
           "AND a.reminder1hSent = false " +
           "AND a.appointmentDate = :targetDate " +
           "AND a.appointmentTime = :targetTime")
    List<Appointment> findAppointmentsFor1hReminder(
        @Param("targetDate") java.time.LocalDate targetDate,
        @Param("targetTime") java.time.LocalTime targetTime
    );
}

