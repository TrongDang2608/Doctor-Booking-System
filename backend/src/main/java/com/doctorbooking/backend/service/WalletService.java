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
        logger.info("Starting completeDepositTransaction: referenceId={}, vnpTransactionNo={}", referenceId, vnpTransactionNo);
        
        WalletTransaction transaction = walletTransactionRepository.findByReferenceId(referenceId);
        if (transaction == null) {
            logger.error("Transaction not found with referenceId: {}", referenceId);
            throw new RuntimeException("Transaction not found with referenceId: " + referenceId);
        }

        logger.info("Found transaction: id={}, status={}, amount={}", transaction.getId(), transaction.getStatus(), transaction.getAmount());

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
        // Giữ nguyên referenceId (đã dùng để tìm transaction), lưu VNPAY transaction no vào description hoặc field khác
        if (vnpTransactionNo != null && !vnpTransactionNo.isEmpty()) {
            transaction.setDescription(transaction.getDescription() + " | VNPAY: " + vnpTransactionNo);
        }
        transaction.setUpdatedAt(LocalDateTime.now());

        patientRepository.save(patient);
        WalletTransaction saved = walletTransactionRepository.save(transaction);
        logger.info("Transaction completed and saved: id={}, status={}, newBalance={}, newPoints={}", 
                saved.getId(), saved.getStatus(), patient.getWalletBalance(), patient.getLoyaltyPoints());
        return saved;
    }

    /**
     * Hủy giao dịch nạp tiền (khi thanh toán thất bại)
     */
    @Transactional
    public WalletTransaction failDepositTransaction(String referenceId, String reason) {
        WalletTransaction transaction = walletTransactionRepository.findByReferenceId(referenceId);
        if (transaction == null) {
            logger.error("Transaction not found with referenceId: {}", referenceId);
            throw new RuntimeException("Transaction not found with referenceId: " + referenceId);
        }

        // Chỉ cập nhật nếu transaction chưa ở trạng thái COMPLETED
        if (transaction.getStatus() == WalletTransaction.TransactionStatus.COMPLETED) {
            logger.warn("Cannot update COMPLETED transaction to FAILED: {}", referenceId);
            return transaction;
        }

        // Cập nhật status thành FAILED
        transaction.setStatus(WalletTransaction.TransactionStatus.FAILED);
        String originalDescription = transaction.getDescription() != null ? transaction.getDescription() : "";
        transaction.setDescription(originalDescription + " - " + reason);
        transaction.setUpdatedAt(LocalDateTime.now());

        WalletTransaction saved = walletTransactionRepository.save(transaction);
        logger.info("Transaction updated to FAILED: referenceId={}, reason={}", referenceId, reason);
        return saved;
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
     * Thanh toán cho appointment bằng ví
     */
    @Transactional
    public WalletTransaction payForAppointment(Long patientId, Long appointmentId, BigDecimal amount, String description) {
        logger.info("Processing wallet payment: patientId={}, appointmentId={}, amount={}", patientId, appointmentId, amount);
        
        Patient patient = getWalletByPatientId(patientId);
        
        // Kiểm tra số dư
        BigDecimal currentBalance = patient.getWalletBalance() != null ? patient.getWalletBalance() : BigDecimal.ZERO;
        if (currentBalance.compareTo(amount) < 0) {
            logger.error("Insufficient balance: required={}, available={}", amount, currentBalance);
            throw new RuntimeException("Insufficient wallet balance. Required: " + amount + ", Available: " + currentBalance);
        }
        
        // Trừ tiền từ ví
        patient.setWalletBalance(currentBalance.subtract(amount));
        logger.info("Deducted amount from wallet. New balance: {}", patient.getWalletBalance());
        
        // Tạo transaction PAYMENT
        WalletTransaction transaction = new WalletTransaction();
        transaction.setPatient(patient);
        transaction.setTransactionType(WalletTransaction.TransactionType.PAYMENT);
        transaction.setAmount(amount);
        transaction.setStatus(WalletTransaction.TransactionStatus.COMPLETED);
        transaction.setPaymentMethod("WALLET");
        transaction.setDescription(description);
        transaction.setReferenceId("APT" + appointmentId + "_" + System.currentTimeMillis());
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());
        
        // Tích điểm (ví dụ: 1% số tiền thanh toán)
        int pointsEarned = amount.divide(new BigDecimal("100"), 0, java.math.RoundingMode.DOWN).intValue();
        transaction.setPointsEarned(pointsEarned);
        
        int currentPoints = patient.getLoyaltyPoints() != null ? patient.getLoyaltyPoints() : 0;
        patient.setLoyaltyPoints(currentPoints + pointsEarned);
        logger.info("Points earned: {}. Total points: {}", pointsEarned, patient.getLoyaltyPoints());
        
        // Cập nhật hạng thành viên
        updateLoyaltyTier(patient);
        
        patientRepository.save(patient);
        WalletTransaction saved = walletTransactionRepository.save(transaction);
        logger.info("Wallet payment completed successfully: transactionId={}", saved.getId());
        return saved;
    }

    /**
     * Hoàn tiền cho appointment bị hủy
     */
    @Transactional
    public WalletTransaction refundAppointment(Long patientId, Long appointmentId, BigDecimal amount, String description) {
        logger.info("Processing appointment refund: patientId={}, appointmentId={}, amount={}", patientId, appointmentId, amount);
        
        Patient patient = getWalletByPatientId(patientId);
        
        // Cộng tiền vào ví
        BigDecimal currentBalance = patient.getWalletBalance() != null ? patient.getWalletBalance() : BigDecimal.ZERO;
        patient.setWalletBalance(currentBalance.add(amount));
        logger.info("Added refund to wallet. New balance: {}", patient.getWalletBalance());
        
        // Tạo transaction REFUND
        WalletTransaction transaction = new WalletTransaction();
        transaction.setPatient(patient);
        transaction.setTransactionType(WalletTransaction.TransactionType.REFUND);
        transaction.setAmount(amount);
        transaction.setStatus(WalletTransaction.TransactionStatus.COMPLETED);
        transaction.setPaymentMethod("WALLET");
        transaction.setDescription(description);
        transaction.setReferenceId("REFUND_APT" + appointmentId + "_" + System.currentTimeMillis());
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());
        
        // Trừ điểm loyalty đã tích lũy từ lần thanh toán (1% số tiền)
        int pointsToDeduct = amount.divide(new BigDecimal("100"), 0, java.math.RoundingMode.DOWN).intValue();
        transaction.setPointsEarned(-pointsToDeduct); // Số âm để biểu thị trừ điểm
        
        int currentPoints = patient.getLoyaltyPoints() != null ? patient.getLoyaltyPoints() : 0;
        int newPoints = Math.max(0, currentPoints - pointsToDeduct); // Không cho phép âm
        patient.setLoyaltyPoints(newPoints);
        logger.info("Points deducted: {}. New total points: {}", pointsToDeduct, newPoints);
        
        // Cập nhật hạng thành viên (có thể bị hạ hạng)
        updateLoyaltyTier(patient);
        
        patientRepository.save(patient);
        WalletTransaction saved = walletTransactionRepository.save(transaction);
        logger.info("Refund completed successfully: transactionId={}", saved.getId());
        return saved;
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

