package com.doctorbooking.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    private static final Logger logger = LoggerFactory.getLogger(VNPayService.class);

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.url}")
    private String vnpUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;
    
    @Value("${vnpay.appointmentReturnUrl}")
    private String appointmentReturnUrl;

    @PostConstruct
    public void init() {
        // Trim và validate VNPAY configuration
        if (hashSecret != null) {
            hashSecret = hashSecret.trim();
        }
        if (tmnCode != null) {
            tmnCode = tmnCode.trim();
        }
        
        logger.info("=== VNPAY Service Initialized ===");
        logger.info("Terminal Code: {}", tmnCode);
        logger.info("Hash Secret Length: {}", hashSecret != null ? hashSecret.length() : 0);
        logger.info("Hash Secret (first 10 chars): {}", hashSecret != null && hashSecret.length() > 10 
            ? hashSecret.substring(0, 10) + "..." : (hashSecret != null ? hashSecret : "NULL"));
        logger.info("VNPAY URL: {}", vnpUrl);
        logger.info("Return URL: {}", returnUrl);
        logger.info("Appointment Return URL: {}", appointmentReturnUrl);
        
        // Validate configuration
        if (hashSecret == null || hashSecret.isEmpty()) {
            logger.error("❌ VNPAY Hash Secret is NULL or EMPTY! Please check your .env file.");
        }
        if (tmnCode == null || tmnCode.isEmpty()) {
            logger.error("❌ VNPAY Terminal Code is NULL or EMPTY! Please check your .env file.");
        }
        logger.info("===================================");
    }

    /**
     * Tạo payment URL cho VNPAY (wallet top-up)
     */
    public String createPaymentUrl(Long amount, String orderInfo, String orderId) {
        return createPaymentUrl(amount, orderInfo, orderId, returnUrl);
    }

    /**
     * Tạo payment URL cho VNPAY với custom return URL (appointment payment)
     */
    public String createPaymentUrlForAppointment(Long amount, String orderInfo, String orderId) {
        return createPaymentUrl(amount, orderInfo, orderId, appointmentReturnUrl);
    }

    /**
     * Tạo payment URL cho VNPAY (internal method)
     */
    private String createPaymentUrl(Long amount, String orderInfo, String orderId, String customReturnUrl) {
        try {
            String vnp_TmnCode = tmnCode;
            String vnp_HashSecret = hashSecret;
            String vnp_Url = vnpUrl;
            String vnp_ReturnUrl = customReturnUrl;

            // Log để kiểm tra Secret Key
            logger.info("=== VNPAY Payment URL Creation ===");
            logger.info("Terminal Code: {}", vnp_TmnCode);
            logger.info("Hash Secret (first 10 chars): {}", vnp_HashSecret != null && vnp_HashSecret.length() > 10 
                ? vnp_HashSecret.substring(0, 10) + "..." : "NULL or EMPTY");
            logger.info("Return URL: {}", vnp_ReturnUrl);
            logger.info("Amount: {} (will be multiplied by 100: {})", amount, amount * 100);
            logger.info("Order Info: {}", orderInfo);
            logger.info("Order ID: {}", orderId);

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPAY yêu cầu số tiền nhân 100
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", orderId);
            vnp_Params.put("vnp_OrderInfo", orderInfo);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
            vnp_Params.put("vnp_IpAddr", "127.0.0.1");

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Sắp xếp params theo thứ tự alphabet
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            
            // Build hash data (theo tài liệu VNPAY: chỉ encode fieldValue, không encode fieldName)
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            
            List<String> validFields = new ArrayList<>();
            for (String fieldName : fieldNames) {
                String fieldValue = vnp_Params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    validFields.add(fieldName);
                }
            }
            
            for (int i = 0; i < validFields.size(); i++) {
                String fieldName = validFields.get(i);
                String fieldValue = vnp_Params.get(fieldName);
                
                // Build hash data (chỉ encode fieldValue)
                String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8);
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(encodedValue);
                
                // Build query (encode cả fieldName và fieldValue)
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                query.append('=');
                query.append(encodedValue);
                
                // Thêm & nếu không phải field cuối cùng
                if (i < validFields.size() - 1) {
                    hashData.append('&');
                    query.append('&');
                }
            }
            
            String queryUrl = query.toString();
            String hashDataString = hashData.toString();
            String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashDataString);
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = vnp_Url + "?" + queryUrl;

            // Log chi tiết để debug
            logger.info("=== Hash Data Construction ===");
            logger.info("Hash Data String: {}", hashDataString);
            logger.info("Secure Hash: {}", vnp_SecureHash);
            logger.info("Final Payment URL: {}", paymentUrl);
            logger.info("===============================");
            
            return paymentUrl;
        } catch (Exception e) {
            logger.error("Error creating VNPAY payment URL", e);
            e.printStackTrace();
            throw new RuntimeException("Failed to create payment URL", e);
        }
    }

    /**
     * Verify checksum từ VNPAY callback
     */
    public boolean verifyPayment(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Build hash data (theo tài liệu VNPAY: chỉ encode fieldValue, không encode fieldName)
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            String vnp_HashSecret = hashSecret;
            String hashDataString = hashData.toString();
            String calculatedHash = hmacSHA512(vnp_HashSecret, hashDataString);

            boolean isValid = vnp_SecureHash.equals(calculatedHash);
            if (!isValid) {
                logger.warn("❌ Invalid VNPAY checksum!");
                logger.warn("Hash Data: {}", hashDataString);
                logger.warn("Expected Hash: {}", calculatedHash);
                logger.warn("Received Hash: {}", vnp_SecureHash);
                logger.warn("Terminal Code used: {}", tmnCode);
            } else {
                logger.info("✅ VNPAY checksum verified successfully");
            }
            return isValid;
        } catch (Exception e) {
            logger.error("Error verifying VNPAY payment", e);
            return false;
        }
    }

    /**
     * HMAC SHA512
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmacSHA512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmacSHA512.init(secretKeySpec);
            byte[] digest = hmacSHA512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            logger.error("Error generating HMAC SHA512", e);
            return "";
        }
    }

    /**
     * Parse response code từ VNPAY
     */
    public String getResponseCode(Map<String, String> params) {
        return params.get("vnp_ResponseCode");
    }

    /**
     * Kiểm tra thanh toán thành công (ResponseCode = "00")
     */
    public boolean isPaymentSuccess(Map<String, String> params) {
        String responseCode = getResponseCode(params);
        return "00".equals(responseCode);
    }
}

