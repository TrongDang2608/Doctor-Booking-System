package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.response.SymptomCheckResponse;
import com.doctorbooking.backend.repository.DoctorRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AISymptomService {

    private final DoctorRepository doctorRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(AISymptomService.class);

    @Value("${google.ai.api-key}")
    private String apiKey;

    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    public SymptomCheckResponse analyzeSymptoms(String symptoms) {
        logger.info("--- Phân tích triệu chứng: '{}' ---", symptoms);

        try {
            // 1. Lấy danh sách chuyên khoa hiện có
            List<String> availableSpecializations = doctorRepository.findDistinctSpecializations();
            String specializationsStr = String.join(", ", availableSpecializations);
            logger.debug("Khoa hiện có: {}", specializationsStr);

            // 2. Tạo Prompt (LOGIC MỚI: THÔNG MINH HƠN)
            String prompt = String.format(
                    "Đóng vai trò là bác sĩ tư vấn từ xa. Phân tích triệu chứng: '%s'. " +
                            "Danh sách chuyên khoa hiện có: [%s]. " +
                            "Nhiệm vụ: " +
                            "1. Xác định vấn đề y tế. " +
                            "2. Kiểm tra vấn đề có thuộc chuyên khoa nào trong danh sách trên không? " +
                            "   - CÓ: 'suggestedSpecialization' = Tên khoa (tiếng Anh). " +
                            "   - KHÔNG: 'suggestedSpecialization' = 'Other'. " +
                            "3. 'advice': Lời khuyên nên làm gì (Tiếng Việt). " +
                            "4. 'homeRemedies': Danh sách 3 việc cần làm tại nhà để giảm đau (Trả về mảng JSON string). " +
                            "5. 'reason': Lý do chẩn đoán (Tiếng Việt). " +
                            "6. 'riskLevel': (Low/Medium/High). " +
                            "Định dạng JSON bắt buộc: " +
                            "{ \"suggestedSpecialization\": \"...\", \"riskLevel\": \"...\", \"advice\": \"...\", \"reason\": \"...\", \"homeRemedies\": [\"Cách 1\", \"Cách 2\", \"Cách 3\"] } " + // <--- Sửa mẫu JSON
                            "Không dùng markdown.",
                    symptoms, specializationsStr
            );

            // 3. Gọi API
            String responseBody = callGeminiApi(prompt);
            return parseGeminiResponse(responseBody);

        } catch (Exception e) {
            logger.error("Lỗi AI: ", e);
            // Trả về fallback an toàn
            return new SymptomCheckResponse(
                    "Other",
                    "Unknown",
                    "Hệ thống bận, vui lòng thử lại.",
                    "Lỗi server",
                    List.of("Nghỉ ngơi và theo dõi thêm.") // <--- Sửa ở đây
            );
        }
    }

    private String callGeminiApi(String prompt) throws Exception {
        String escapedPrompt = prompt.replace("\"", "\\\"").replace("\n", " ");
        String requestBody = String.format("{ \"contents\": [{ \"parts\": [{ \"text\": \"%s\" }] }] }", escapedPrompt);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_URL + "?key=" + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) throw new RuntimeException("API Error: " + response.body());
        return response.body();
    }

    private SymptomCheckResponse parseGeminiResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            String aiText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            aiText = aiText.replace("```json", "").replace("```", "").trim();
            return objectMapper.readValue(aiText, SymptomCheckResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Parse Error", e);
        }
    }
}