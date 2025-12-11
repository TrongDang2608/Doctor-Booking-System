package com.doctorbooking.backend.repository;

import com.doctorbooking.backend.model.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicationRepository extends JpaRepository<Medication, Long> {

    @Query("""
            SELECT m FROM Medication m
            WHERE (:search IS NULL OR :search = '' 
                   OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(m.category) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY m.name ASC
            """)
    List<Medication> search(@Param("search") String search);
}

