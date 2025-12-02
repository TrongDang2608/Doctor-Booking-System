package com.doctorbooking.backend.service;

import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.model.WalletTransaction;
import com.doctorbooking.backend.repository.PatientRepository;
import com.doctorbooking.backend.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

    private static final Logger logger = LoggerFactory.getLogger(WalletService.class);
    private final PatientRepository patientRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    /**
     * Lấy thông tin ví của patient
     */
    public Patient getWalletByPatientId(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    /**
     * Tạo transaction cho nạp tiền (PENDING)
     */
    @Transactional
    public WalletTransaction createDepositTransaction(Long patientId, BigDecimal amount, String paymentMethod) {
        Patient patient = getWalletByPatientId(patientId);
        
        WalletTransaction transaction = new WalletTransaction();
        transaction.setPatient(patient);
        transaction.setTransactionType(WalletTransaction.TransactionType.DEPOSIT);
        transaction.setAmount(amount);
        transaction.setStatus(WalletTransaction.TransactionStatus.PENDING);
        transaction.setPaymentMethod(paymentMethod);
        transaction.setDescription("Nạp tiền vào ví qua " + paymentMethod);
        transaction.setReferenceId(UUID.randomUUID().toString());
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());

        return walletTransactionRepository.save(transaction);
    }

    /**
     * Xác nhận và hoàn tất giao dịch nạp tiền
     */
    @Transactional
    public WalletTransaction completeDepositTransaction(String referenceId, String vnpTransactionNo) {
        WalletTransaction transaction = walletTransactionRepository.findByReferenceId(referenceId);
        if (transaction == null) {
            throw new RuntimeException("Transaction not found");
        }

        if (transaction.getStatus() == WalletTransaction.TransactionStatus.COMPLETED) {
            logger.warn("Transaction already completed: {}", referenceId);
            return transaction;
        }

        Patient patient = transaction.getPatient();
        BigDecimal amount = transaction.getAmount();

        // Cập nhật số dư ví
        BigDecimal currentBalance = patient.getWalletBalance() != null ? patient.getWalletBalance() : BigDecimal.ZERO;
        patient.setWalletBalance(currentBalance.add(amount));

        // Tính điểm tích lũy (1% số tiền nạp)
        int pointsEarned = amount.divide(new BigDecimal("100"), 0, java.math.RoundingMode.DOWN).intValue();
        transaction.setPointsEarned(pointsEarned);
        
        // Cập nhật điểm tích lũy của patient
        int currentPoints = patient.getLoyaltyPoints() != null ? patient.getLoyaltyPoints() : 0;
        patient.setLoyaltyPoints(currentPoints + pointsEarned);
        
        // Cập nhật hạng thành viên
        updateLoyaltyTier(patient);

        // Cập nhật transaction
        transaction.setStatus(WalletTransaction.TransactionStatus.COMPLETED);
        transaction.setReferenceId(vnpTransactionNo); // Lưu transaction ID từ VNPAY
        transaction.setUpdatedAt(LocalDateTime.now());

        patientRepository.save(patient);
        return walletTransactionRepository.save(transaction);
    }

    /**
     * Hủy giao dịch nạp tiền (khi thanh toán thất bại)
     */
    @Transactional
    public WalletTransaction failDepositTransaction(String referenceId, String reason) {
        WalletTransaction transaction = walletTransactionRepository.findByReferenceId(referenceId);
        if (transaction == null) {
            throw new RuntimeException("Transaction not found");
        }

        transaction.setStatus(WalletTransaction.TransactionStatus.FAILED);
        transaction.setDescription(transaction.getDescription() + " - " + reason);
        transaction.setUpdatedAt(LocalDateTime.now());

        return walletTransactionRepository.save(transaction);
    }

    /**
     * Lấy lịch sử giao dịch
     */
    public Page<WalletTransaction> getTransactions(Long patientId, Pageable pageable) {
        return walletTransactionRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable);
    }

    public List<WalletTransaction> getTransactions(Long patientId) {
        return walletTransactionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    /**
     * Cập nhật hạng thành viên dựa trên điểm tích lũy
     */
    private void updateLoyaltyTier(Patient patient) {
        int points = patient.getLoyaltyPoints() != null ? patient.getLoyaltyPoints() : 0;
        
        if (points >= 10000) {
            patient.setLoyaltyTier("PLATINUM");
        } else if (points >= 5000) {
            patient.setLoyaltyTier("GOLD");
        } else if (points >= 1000) {
            patient.setLoyaltyTier("SILVER");
        } else {
            patient.setLoyaltyTier("BRONZE");
        }
    }
}

