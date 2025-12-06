package com.doctorbooking.backend.repository;

import com.doctorbooking.backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUserId(Long userId);
    
    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.user u WHERE u.username = :username")
    Optional<Patient> findByUser_Username(@Param("username") String username);
    
    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "CAST(p.id AS string) LIKE CONCAT('%', :keyword, '%')")
    List<Patient> searchPatients(@Param("keyword") String keyword);
}

