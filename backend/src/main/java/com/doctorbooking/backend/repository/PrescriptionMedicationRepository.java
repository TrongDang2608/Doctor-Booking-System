package com.doctorbooking.backend.repository;

import com.doctorbooking.backend.model.PrescriptionMedication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionMedicationRepository extends JpaRepository<PrescriptionMedication, Long> {
    List<PrescriptionMedication> findByTreatmentIdOrderByOrderIndexAsc(Long treatmentId);
    void deleteByTreatmentId(Long treatmentId);
}

