package com.doctorbooking.backend.service;

import com.doctorbooking.backend.model.Medication;
import com.doctorbooking.backend.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepository;

    public List<Medication> searchMedications(String search, Integer limit) {
        List<Medication> meds = medicationRepository.search(search);
        if (limit != null && limit > 0 && meds.size() > limit) {
            return meds.subList(0, limit);
        }
        return meds;
    }
}

