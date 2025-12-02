package com.doctorbooking.backend.repository;

import com.doctorbooking.backend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);
    List<Doctor> findByStatus(Doctor.DoctorStatus status);
    
    @Query("SELECT d FROM Doctor d WHERE " +
           "LOWER(d.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Doctor> searchDoctors(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT d.specialization FROM Doctor d WHERE d.status = 'ACTIVE'")
    List<String> findDistinctSpecializations();
}

