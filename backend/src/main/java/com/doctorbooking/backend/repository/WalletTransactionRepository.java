package com.doctorbooking.backend.repository;

import com.doctorbooking.backend.model.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    Page<WalletTransaction> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);
    List<WalletTransaction> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    WalletTransaction findByReferenceId(String referenceId);
}

