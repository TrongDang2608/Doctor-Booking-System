package com.doctorbooking.backend.controller;

import com.doctorbooking.backend.dto.request.TopUpRequest;
import com.doctorbooking.backend.dto.response.TopUpResponse;
import com.doctorbooking.backend.dto.response.WalletResponse;
import com.doctorbooking.backend.dto.response.WalletTransactionResponse;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.model.WalletTransaction;
import com.doctorbooking.backend.model.User;
import com.doctorbooking.backend.repository.PatientRepository;
import com.doctorbooking.backend.service.PatientService;
import com.doctorbooking.backend.service.UserService;
import com.doctorbooking.backend.service.VNPayService;
import com.doctorbooking.backend.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final WalletService walletService;
    private final VNPayService vnPayService;
    private final UserService userService;
    private final PatientRepository patientRepository;

    /**
     * Lấy thông tin ví
     */
    @GetMapping("/wallet")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<WalletResponse> getWallet() {
        try {
            Long userId = getCurrentUserId();
            Patient patient = patientRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            
            WalletResponse response = new WalletResponse(
                    patient.getWalletBalance() != null ? patient.getWalletBalance() : BigDecimal.ZERO,
                    patient.getLoyaltyPoints() != null ? patient.getLoyaltyPoints() : 0,
                    patient.getLoyaltyTier() != null ? patient.getLoyaltyTier() : "BRONZE"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting wallet", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Tạo yêu cầu nạp tiền
     */
    @PostMapping("/wallet/top-up")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<TopUpResponse> topUp(@Valid @RequestBody TopUpRequest request) {
        try {
            Long userId = getCurrentUserId();
            Patient patient = patientRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            Long patientId = patient.getId();

            // Validate amount
            if (request.getAmount().compareTo(new BigDecimal("10000")) < 0) {
                return ResponseEntity.badRequest().build();
            }
            if (request.getAmount().compareTo(new BigDecimal("50000000")) > 0) {
                return ResponseEntity.badRequest().build();
            }

            // Tạo transaction
            WalletTransaction transaction = walletService.createDepositTransaction(
                    patientId,
                    request.getAmount(),
                    request.getPaymentMethod()
            );

            // Tạo payment URL
            String orderInfo = "Nap tien vao vi - " + patient.getFullName();
            String paymentUrl = vnPayService.createPaymentUrl(
                    request.getAmount().longValue(),
                    orderInfo,
                    transaction.getReferenceId()
            );

            TopUpResponse response = new TopUpResponse();
            response.setPaymentUrl(paymentUrl);
            response.setTransactionId(transaction.getReferenceId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating top-up request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Callback từ VNPAY sau khi thanh toán
     */
    @GetMapping("/payments/vnpay/callback")
    public org.springframework.web.servlet.ModelAndView vnpayCallback(HttpServletRequest request) {
        logger.info("=== VNPAY CALLBACK RECEIVED ===");
        logger.info("Request URL: {}", request.getRequestURL());
        logger.info("Query String: {}", request.getQueryString());
        
        try {
            Map<String, String> vnpParams = new HashMap<>();
            for (String paramName : request.getParameterMap().keySet()) {
                String[] paramValues = request.getParameterValues(paramName);
                String paramValue = paramValues != null && paramValues.length > 0 ? paramValues[0] : null;
                vnpParams.put(paramName, paramValue);
                logger.debug("VNPAY Param: {} = {}", paramName, paramValue);
            }

            logger.info("VNPAY Callback received with {} params", vnpParams.size());
            logger.info("VNPAY Params: {}", vnpParams);

            String vnp_ResponseCode = vnpParams.get("vnp_ResponseCode");
            String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
            String vnp_TransactionNo = vnpParams.get("vnp_TransactionNo");

            // Verify checksum
            boolean isValid = vnPayService.verifyPayment(vnpParams);
            if (!isValid) {
                logger.warn("Invalid VNPAY checksum for transaction: {}", vnp_TxnRef);
                // Cập nhật transaction thành FAILED khi checksum không hợp lệ
                if (vnp_TxnRef != null && !vnp_TxnRef.isEmpty()) {
                    try {
                        walletService.failDepositTransaction(vnp_TxnRef, "Invalid checksum");
                    } catch (Exception e) {
                        logger.error("Error updating transaction status for invalid checksum", e);
                    }
                }
                String redirectUrl = "http://localhost:5173/patient/wallet/payment/result?code=97&message=Invalid%20checksum&vnp_TxnRef=" + (vnp_TxnRef != null ? vnp_TxnRef : "");
                return new org.springframework.web.servlet.ModelAndView("redirect:" + redirectUrl);
            }

            String redirectUrl = "http://localhost:5173/patient/wallet/payment/result";
            
            // Build query string with all VNPAY params
            StringBuilder queryString = new StringBuilder();
            queryString.append("?code=").append(vnp_ResponseCode);
            queryString.append("&vnp_ResponseCode=").append(vnp_ResponseCode);
            queryString.append("&vnp_TxnRef=").append(vnp_TxnRef);
            queryString.append("&transactionId=").append(vnp_TxnRef);
            
            if (vnp_TransactionNo != null) {
                queryString.append("&vnp_TransactionNo=").append(vnp_TransactionNo);
            }
            if (vnpParams.get("vnp_Amount") != null) {
                queryString.append("&vnp_Amount=").append(vnpParams.get("vnp_Amount"));
            }
            if (vnpParams.get("vnp_OrderInfo") != null) {
                queryString.append("&vnp_OrderInfo=").append(java.net.URLEncoder.encode(vnpParams.get("vnp_OrderInfo"), java.nio.charset.StandardCharsets.UTF_8));
            }
            if (vnpParams.get("vnp_BankCode") != null) {
                queryString.append("&vnp_BankCode=").append(vnpParams.get("vnp_BankCode"));
            }
            if (vnpParams.get("vnp_PayDate") != null) {
                queryString.append("&vnp_PayDate=").append(vnpParams.get("vnp_PayDate"));
            }
            
            // Validate vnp_TxnRef
            if (vnp_TxnRef == null || vnp_TxnRef.isEmpty()) {
                logger.error("vnp_TxnRef is null or empty in callback");
                String errorRedirectUrl = "http://localhost:5173/patient/wallet/payment/result?code=99&message=Missing%20transaction%20ID";
                return new org.springframework.web.servlet.ModelAndView("redirect:" + errorRedirectUrl);
            }

            if ("00".equals(vnp_ResponseCode)) {
                // Thanh toán thành công
                logger.info("Processing successful payment for transaction: {}", vnp_TxnRef);
                try {
                    WalletTransaction updated = walletService.completeDepositTransaction(vnp_TxnRef, vnp_TransactionNo);
                    logger.info("Transaction completed successfully: {} -> Status: {}", vnp_TxnRef, updated.getStatus());
                    queryString.append("&message=Thanh%20toan%20thanh%20cong");
                } catch (Exception e) {
                    logger.error("Error completing transaction: {}", vnp_TxnRef, e);
                    e.printStackTrace();
                    queryString.append("&message=Loi%20cap%20nhat%20giao%20dich");
                }
            } else {
                // Thanh toán thất bại - CẬP NHẬT STATUS THÀNH FAILED
                logger.info("Processing failed payment for transaction: {}, ResponseCode: {}", vnp_TxnRef, vnp_ResponseCode);
                try {
                    WalletTransaction updated = walletService.failDepositTransaction(vnp_TxnRef, "Payment failed: ResponseCode=" + vnp_ResponseCode);
                    logger.info("Transaction failed and updated to FAILED: {} -> Status: {}", vnp_TxnRef, updated.getStatus());
                    queryString.append("&message=Thanh%20toan%20that%20bai");
                } catch (Exception e) {
                    logger.error("Error updating transaction to FAILED: {}", vnp_TxnRef, e);
                    e.printStackTrace();
                    queryString.append("&message=Loi%20cap%20nhat%20giao%20dich");
                }
            }
            
            redirectUrl += queryString.toString();

            return new org.springframework.web.servlet.ModelAndView("redirect:" + redirectUrl);
        } catch (Exception e) {
            logger.error("Error processing VNPAY callback", e);
            // Cố gắng cập nhật transaction thành FAILED nếu có vnp_TxnRef
            try {
                String vnp_TxnRef = request.getParameter("vnp_TxnRef");
                if (vnp_TxnRef != null && !vnp_TxnRef.isEmpty()) {
                    walletService.failDepositTransaction(vnp_TxnRef, "System error: " + e.getMessage());
                    logger.info("Transaction updated to FAILED due to system error: {}", vnp_TxnRef);
                }
            } catch (Exception updateEx) {
                logger.error("Error updating transaction status in exception handler", updateEx);
            }
            String redirectUrl = "http://localhost:5173/patient/wallet/payment/result?code=99&message=Loi%20he%20thong";
            return new org.springframework.web.servlet.ModelAndView("redirect:" + redirectUrl);
        }
    }

    /**
     * Lấy lịch sử giao dịch
     */
    @GetMapping("/wallet/transactions")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Long userId = getCurrentUserId();
            Patient patient = patientRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            Long patientId = patient.getId();

            Pageable pageable = PageRequest.of(page, size);
            Page<WalletTransaction> transactions = walletService.getTransactions(patientId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("transactions", transactions.getContent().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList()));
            response.put("totalPages", transactions.getTotalPages());
            response.put("totalElements", transactions.getTotalElements());
            response.put("currentPage", transactions.getNumber());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private WalletTransactionResponse mapToResponse(WalletTransaction transaction) {
        return new WalletTransactionResponse(
                transaction.getId(),
                transaction.getTransactionType().name(),
                transaction.getAmount(),
                transaction.getPointsEarned(),
                transaction.getDescription(),
                transaction.getStatus().name(),
                transaction.getPaymentMethod(),
                transaction.getCreatedAt()
        );
    }

    private Long getCurrentUserId() {
        org.springframework.security.core.Authentication authentication = 
                SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user.getId();
    }
}

