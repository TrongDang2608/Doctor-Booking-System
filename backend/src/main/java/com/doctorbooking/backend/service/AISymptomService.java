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
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AISymptomService {

    private final DoctorRepository doctorRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(AISymptomService.class);
    private static final int MAX_RETRIES = 2;
    private static final int TIMEOUT_SECONDS = 30;

    @Value("${google.ai.api-key}")
    private String apiKey;

    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    public SymptomCheckResponse analyzeSymptoms(String userInput) {
        logger.info("--- Nhận input từ người dùng: '{}' ---", userInput);

        try {
            // 1. Lấy danh sách chuyên khoa hiện có
            List<String> availableSpecializations = doctorRepository.findDistinctSpecializations();
            String specializationsStr = String.join(", ", availableSpecializations);
            logger.debug("Khoa hiện có: {}", specializationsStr);

            // 2. Tạo Prompt thông minh hơn - có thể xử lý cả câu hỏi chung chung
            String prompt = buildSmartPrompt(userInput, specializationsStr);

            // 3. Gọi API với retry logic
            String responseBody = callGeminiApiWithRetry(prompt);
            
            // 4. Parse response với xử lý lỗi tốt hơn
            return parseGeminiResponse(responseBody, userInput, specializationsStr);

        } catch (Exception e) {
            logger.error("Lỗi khi phân tích input: ", e);
            // Trả về response thông minh hơn dựa trên loại lỗi
            return createFallbackResponse(userInput, e);
        }
    }

    private String buildSmartPrompt(String userInput, String specializationsStr) {
        // Tạo mapping triệu chứng -> chuyên khoa để AI hiểu rõ hơn
        String symptomMappingGuide = buildSymptomMappingGuide(specializationsStr);
        
        return String.format(
                "Bạn là trợ lý sức khỏe thông minh và thân thiện của hệ thống đặt lịch khám bệnh. " +
                "Người dùng đã nói: '%s'. " +
                "Danh sách các chuyên khoa hiện có trong hệ thống: [%s]. " +
                "\n\n" +
                "%s" +
                "\n\n" +
                "NHIỆM VỤ CỦA BẠN (phân tích kỹ loại câu nói của người dùng): " +
                "\n\n" +
                "1. Nếu người dùng CHÀO HỎI hoặc NÓI CHUYỆN XÃ GIAO (ví dụ: 'xin chào', 'hello', 'chào bạn', 'cảm ơn', 'tạm biệt', v.v.): " +
                "   - Trả lời một cách tự nhiên, thân thiện và ngắn gọn như một cuộc trò chuyện bình thường. " +
                "   - Giới thiệu ngắn gọn về khả năng của bạn và hướng dẫn cách sử dụng. " +
                "   - 'suggestedSpecialization': 'Other'. " +
                "   - 'riskLevel': 'Low'. " +
                "   - 'advice': Câu trả lời tự nhiên, thân thiện, KHÔNG dùng từ 'chẩn đoán', KHÔNG đưa ra lời khuyên y tế. " +
                "   - 'reason': Để TRỐNG (empty string \"\") - KHÔNG đưa ra lý do kỹ thuật. " +
                "   - 'homeRemedies': Để TRỐNG (mảng rỗng []) - KHÔNG đưa ra lời khuyên tại nhà khi chỉ là chào hỏi. " +
                "\n\n" +
                "2. Nếu người dùng mô tả TRIỆU CHỨNG bệnh (ví dụ: 'đau đầu', 'sốt', 'ho', 'đau bụng', 'nôn', 'đau dạ dày', v.v.): " +
                "   - Phân tích triệu chứng một cách chuyên nghiệp và xác định chuyên khoa phù hợp NHẤT từ danh sách trên. " +
                "   - SỬ DỤNG BẢNG MAPPING Ở TRÊN để tìm chuyên khoa phù hợp. " +
                "   - Nếu có chuyên khoa phù hợp: 'suggestedSpecialization' = tên khoa (tiếng Anh, chính xác như trong danh sách). " +
                "   - Nếu không có khoa chính xác nhưng có khoa GẦN NHẤT: chọn khoa gần nhất (ví dụ: đau bụng -> Gastroenterology hoặc Internal Medicine nếu có). " +
                "   - CHỈ đặt 'Other' khi thực sự không có khoa nào liên quan. " +
                "   - 'riskLevel': Đánh giá mức độ nghiêm trọng dựa trên triệu chứng (Low/Medium/High). " +
                "   - 'advice': Lời khuyên cụ thể về việc nên làm gì, BAO GỒM gợi ý khám chuyên khoa nào (Tiếng Việt, chi tiết, chuyên nghiệp). " +
                "   - 'reason': Giải thích ngắn gọn tại sao nên khám khoa đó (Tiếng Việt, dễ hiểu, KHÔNG dùng từ kỹ thuật như 'người dùng'). " +
                "   - 'homeRemedies': Danh sách 2-3 biện pháp tại nhà để giảm triệu chứng (mảng JSON string, Tiếng Việt). " +
                "\n\n" +
                "3. Nếu người dùng hỏi CÂU HỎI FOLLOW-UP về khoa khám (ví dụ: 'vậy tôi nên khám khoa nào', 'nên khám ở khoa nào', 'khoa nào phù hợp', 'tôi nên khám khoa nào ở hệ thống bên bạn'): " +
                "   - Đây là câu hỏi follow-up, có nghĩa là người dùng đã nói về triệu chứng trước đó. " +
                "   - PHÂN TÍCH câu hỏi để tìm manh mối về triệu chứng (ví dụ: nếu câu hỏi có từ 'đau bụng' -> Gastroenterology). " +
                "   - Nếu câu hỏi KHÔNG chứa triệu chứng cụ thể: trả lời chung chung về cách sử dụng hệ thống và yêu cầu mô tả triệu chứng. " +
                "   - Nếu câu hỏi CÓ chứa triệu chứng: gợi ý khoa phù hợp dựa trên triệu chứng đó. " +
                "   - 'suggestedSpecialization': Khoa phù hợp hoặc 'Other' nếu không xác định được. " +
                "   - 'riskLevel': 'Low' (vì đây là câu hỏi thông tin). " +
                "   - 'advice': Trả lời câu hỏi một cách chi tiết, gợi ý khoa cụ thể nếu có thể. " +
                "   - 'reason': Giải thích ngắn gọn tại sao gợi ý khoa đó (Tiếng Việt, dễ hiểu). " +
                "   - 'homeRemedies': Để TRỐNG hoặc thêm 1-2 lời khuyên chung nếu phù hợp. " +
                "\n\n" +
                "4. Nếu người dùng hỏi CÂU HỎI CHUNG về y tế (ví dụ: 'các chuyên khoa có gì', 'tìm bác sĩ', v.v.): " +
                "   - Trả lời câu hỏi một cách hữu ích và chuyên nghiệp (Tiếng Việt). " +
                "   - Liệt kê các chuyên khoa có sẵn nếu được hỏi. " +
                "   - 'suggestedSpecialization': 'Other' hoặc khoa phù hợp nếu câu hỏi cụ thể. " +
                "   - 'riskLevel': 'Low'. " +
                "   - 'advice': Trả lời câu hỏi một cách chi tiết và hữu ích. " +
                "   - 'reason': Để TRỐNG hoặc giải thích ngắn gọn. " +
                "   - 'homeRemedies': Để TRỐNG. " +
                "\n\n" +
                "5. Nếu người dùng nói điều gì KHÔNG LIÊN QUAN đến y tế: " +
                "   - Trả lời lịch sự và chuyên nghiệp. " +
                "   - Nhẹ nhàng hướng dẫn người dùng cách sử dụng hệ thống. " +
                "   - 'suggestedSpecialization': 'Other'. " +
                "   - 'riskLevel': 'Low'. " +
                "   - 'advice': Câu trả lời thân thiện, hướng dẫn cách sử dụng. " +
                "   - 'reason': Để TRỐNG. " +
                "   - 'homeRemedies': Để TRỐNG. " +
                "\n\n" +
                "QUY TẮC QUAN TRỌNG: " +
                "- LUÔN cố gắng tìm chuyên khoa phù hợp từ danh sách, CHỈ dùng 'Other' khi thực sự không có khoa nào liên quan. " +
                "- Nếu không có khoa chính xác, chọn khoa GẦN NHẤT (ví dụ: đau bụng -> Gastroenterology, không có thì Internal Medicine). " +
                "- 'reason' CHỈ điền khi có phân tích y tế thực sự, KHÔNG điền khi chỉ là chào hỏi. " +
                "- 'homeRemedies' CHỈ điền khi có triệu chứng cụ thể cần lời khuyên tại nhà. " +
                "- 'advice' phải tự nhiên, không dùng từ kỹ thuật như 'người dùng', 'hệ thống', 'phân tích', v.v. " +
                "- Luôn trả lời bằng Tiếng Việt, trừ tên chuyên khoa (tiếng Anh). " +
                "- Luôn trả về đúng định dạng JSON, KHÔNG dùng markdown, KHÔNG dùng code block. " +
                "\n\n" +
                "ĐỊNH DẠNG JSON BẮT BUỘC (chỉ trả về JSON thuần, không có text khác): " +
                "{ " +
                "\"suggestedSpecialization\": \"Tên khoa hoặc Other\", " +
                "\"riskLevel\": \"Low/Medium/High\", " +
                "\"advice\": \"Câu trả lời tự nhiên bằng Tiếng Việt\", " +
                "\"reason\": \"Lý do (để trống nếu không cần)\", " +
                "\"homeRemedies\": [\"Biện pháp 1\", \"Biện pháp 2\"] hoặc [] nếu không cần " +
                "}",
                userInput, specializationsStr, symptomMappingGuide
        );
    }

    private String buildSymptomMappingGuide(String specializationsStr) {
        return "BẢNG MAPPING TRIỆU CHỨNG -> CHUYÊN KHOA (sử dụng để gợi ý chính xác):\n" +
                "- Đau bụng, đau dạ dày, nôn, buồn nôn, tiêu chảy, táo bón, đầy hơi, khó tiêu -> Gastroenterology (Tiêu hóa) hoặc Internal Medicine (Nội khoa)\n" +
                "- Đau đầu, chóng mặt, đau nửa đầu, co giật -> Neurology (Thần kinh)\n" +
                "- Đau ngực, khó thở, tim đập nhanh, huyết áp cao -> Cardiology (Tim mạch)\n" +
                "- Ho, đau họng, nghẹt mũi, đau tai -> ENT (Tai mũi họng) hoặc Pulmonology (Hô hấp)\n" +
                "- Đau khớp, đau lưng, đau cổ, viêm khớp -> Orthopedics (Xương khớp) hoặc Rheumatology (Thấp khớp)\n" +
                "- Phát ban, ngứa, mụn, viêm da -> Dermatology (Da liễu)\n" +
                "- Đau mắt, mờ mắt, đỏ mắt -> Ophthalmology (Mắt)\n" +
                "- Lo âu, trầm cảm, mất ngủ, stress -> Psychiatry (Tâm thần) hoặc Psychology (Tâm lý)\n" +
                "- Vấn đề về kinh nguyệt, mang thai, phụ khoa -> Obstetrics/Gynecology (Sản phụ khoa)\n" +
                "- Bệnh trẻ em, sốt ở trẻ, phát triển trẻ -> Pediatrics (Nhi khoa)\n" +
                "- Tiểu đường, béo phì, rối loạn hormone -> Endocrinology (Nội tiết)\n" +
                "- Ung thư, khối u -> Oncology (Ung bướu)\n" +
                "\n" +
                "LƯU Ý: Nếu trong danh sách chuyên khoa [" + specializationsStr + "] không có khoa chính xác, hãy chọn khoa GẦN NHẤT hoặc phù hợp nhất. " +
                "Ví dụ: Nếu không có 'Gastroenterology' nhưng có 'Internal Medicine', thì chọn 'Internal Medicine' cho đau bụng.\n";
    }

    private String callGeminiApiWithRetry(String prompt) throws Exception {
        Exception lastException = null;
        
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                logger.debug("Gọi Gemini API - Lần thử: {}/{}", attempt, MAX_RETRIES);
                return callGeminiApi(prompt);
            } catch (Exception e) {
                lastException = e;
                logger.warn("Lần thử {} thất bại: {}", attempt, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    // Đợi một chút trước khi retry
                    Thread.sleep(1000 * attempt);
                }
            }
        }
        
        throw new RuntimeException("Không thể kết nối đến Gemini API sau " + MAX_RETRIES + " lần thử", lastException);
    }

    private String callGeminiApi(String prompt) throws Exception {
        // Escape prompt đúng cách
        String escapedPrompt = prompt.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
        
        String requestBody = String.format(
                "{ \"contents\": [{ \"parts\": [{ \"text\": \"%s\" }] }] }",
                escapedPrompt
        );

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(TIMEOUT_SECONDS))
                .build();
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_URL + "?key=" + apiKey))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(TIMEOUT_SECONDS))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            logger.error("Gemini API trả về status code: {}, body: {}", response.statusCode(), response.body());
            throw new RuntimeException("Gemini API Error (Status: " + response.statusCode() + "): " + response.body());
        }
        
        return response.body();
    }

    private SymptomCheckResponse parseGeminiResponse(String jsonResponse, String userInput, String specializationsStr) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            
            // Kiểm tra cấu trúc response
            if (!root.has("candidates") || root.get("candidates").size() == 0) {
                throw new RuntimeException("Response không có candidates");
            }
            
            JsonNode candidate = root.get("candidates").get(0);
            if (!candidate.has("content") || !candidate.get("content").has("parts")) {
                throw new RuntimeException("Response không có content.parts");
            }
            
            String aiText = candidate.get("content").get("parts").get(0).get("text").asText();
            logger.debug("Raw AI response: {}", aiText);
            
            // Làm sạch response - loại bỏ markdown và code blocks
            aiText = cleanJsonResponse(aiText);
            
            // Parse JSON
            SymptomCheckResponse response = objectMapper.readValue(aiText, SymptomCheckResponse.class);
            
            // Validate và fix response
            return validateAndFixResponse(response, userInput, specializationsStr);
            
        } catch (Exception e) {
            logger.error("Lỗi khi parse response từ Gemini: {}", e.getMessage());
            logger.debug("Response gốc: {}", jsonResponse);
            // Thử parse thủ công nếu có thể
            return tryManualParse(jsonResponse, userInput, specializationsStr, e);
        }
    }

    private String cleanJsonResponse(String text) {
        // Loại bỏ markdown code blocks
        text = text.replace("```json", "").replace("```", "").trim();
        
        // Tìm JSON object trong text
        Pattern jsonPattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
        Matcher matcher = jsonPattern.matcher(text);
        
        if (matcher.find()) {
            return matcher.group(0).trim();
        }
        
        return text.trim();
    }

    private SymptomCheckResponse validateAndFixResponse(SymptomCheckResponse response, String userInput, String specializationsStr) {
        // Đảm bảo các field không null
        if (response.getSuggestedSpecialization() == null || response.getSuggestedSpecialization().isEmpty()) {
            response.setSuggestedSpecialization("Other");
        }
        
        if (response.getRiskLevel() == null || response.getRiskLevel().isEmpty()) {
            response.setRiskLevel("Low");
        }
        
        if (response.getAdvice() == null || response.getAdvice().isEmpty()) {
            response.setAdvice("Vui lòng mô tả rõ hơn về vấn đề sức khỏe của bạn để tôi có thể tư vấn tốt hơn.");
        }
        
        // Reason có thể để trống nếu không cần thiết (ví dụ: câu chào hỏi)
        if (response.getReason() == null) {
            response.setReason("");
        }
        // Loại bỏ các reason không phù hợp (nghe như log)
        String reason = response.getReason().trim();
        if (reason.toLowerCase().contains("người dùng chỉ nói") || 
            reason.toLowerCase().contains("cần thêm thông tin") ||
            reason.isEmpty()) {
            response.setReason("");
        }
        
        if (response.getHomeRemedies() == null) {
            response.setHomeRemedies(new ArrayList<>());
        }
        
        // KHÔNG tự động thêm homeRemedies nếu rỗng - để AI quyết định
        // Chỉ đảm bảo không null
        
        return response;
    }

    private SymptomCheckResponse tryManualParse(String jsonResponse, String userInput, String specializationsStr, Exception originalError) {
        try {
            // Thử extract text từ response
            Pattern textPattern = Pattern.compile("\"text\"\\s*:\\s*\"([^\"]+)\"", Pattern.DOTALL);
            Matcher matcher = textPattern.matcher(jsonResponse);
            
            if (matcher.find()) {
                String aiText = matcher.group(1)
                        .replace("\\n", " ")
                        .replace("\\\"", "\"");
                
                // Thử tìm JSON trong text
                String cleaned = cleanJsonResponse(aiText);
                return objectMapper.readValue(cleaned, SymptomCheckResponse.class);
            }
        } catch (Exception e) {
            logger.debug("Manual parse cũng thất bại: {}", e.getMessage());
        }
        
        // Nếu không parse được, tạo response thông minh dựa trên input
        return createIntelligentFallback(userInput, specializationsStr, originalError);
    }

    private SymptomCheckResponse createIntelligentFallback(String userInput, String specializationsStr, Exception error) {
        String lowerInput = userInput.toLowerCase().trim();
        
        // Phát hiện câu chào hỏi
        boolean isGreeting = lowerInput.equals("xin chào") || 
                            lowerInput.equals("hello") || 
                            lowerInput.equals("chào") ||
                            lowerInput.equals("chào bạn") ||
                            lowerInput.startsWith("xin chào") ||
                            lowerInput.startsWith("hello");
        
        // Phát hiện loại câu hỏi
        boolean isQuestion = lowerInput.contains("nên") || lowerInput.contains("khám") || 
                            lowerInput.contains("khoa nào") || lowerInput.contains("bác sĩ");
        
        String advice;
        String reason;
        List<String> homeRemedies;
        
        if (isGreeting) {
            // Câu chào hỏi - trả lời tự nhiên, không đưa ra chẩn đoán hay lời khuyên y tế
            advice = "Xin chào! Tôi là HealthAI, trợ lý sức khỏe thông minh của bạn. " +
                    "Tôi có thể giúp bạn: " +
                    "• Phân tích triệu chứng và gợi ý chuyên khoa phù hợp " +
                    "• Tư vấn về các vấn đề sức khỏe " +
                    "• Hướng dẫn đặt lịch khám với bác sĩ " +
                    "Bạn hãy mô tả triệu chứng hoặc đặt câu hỏi để tôi hỗ trợ bạn nhé!";
            reason = ""; // Không có chẩn đoán cho câu chào hỏi
            homeRemedies = new ArrayList<>(); // Không có lời khuyên tại nhà
        } else if (isQuestion) {
            advice = "Dựa trên câu hỏi của bạn, tôi khuyên bạn nên: " +
                    "1. Mô tả rõ các triệu chứng bạn đang gặp phải. " +
                    "2. Tôi sẽ phân tích và gợi ý chuyên khoa phù hợp từ hệ thống. " +
                    "3. Sau đó bạn có thể đặt lịch khám với bác sĩ chuyên khoa đó. " +
                    "Các chuyên khoa hiện có trong hệ thống: " + specializationsStr + ".";
            reason = "Bạn đang hỏi về việc nên khám ở đâu. Tôi cần thêm thông tin về triệu chứng để tư vấn chính xác hơn.";
            homeRemedies = Arrays.asList(
                    "Mô tả chi tiết các triệu chứng bạn đang gặp phải.",
                    "Cung cấp thông tin về thời gian và mức độ nghiêm trọng của triệu chứng."
            );
        } else {
            advice = "Cảm ơn bạn đã chia sẻ. Tôi đang xử lý thông tin của bạn. " +
                    "Vui lòng thử lại sau một chút hoặc mô tả rõ hơn về vấn đề sức khỏe bạn đang gặp phải.";
            reason = ""; // Không có thông tin đủ để chẩn đoán
            homeRemedies = new ArrayList<>(); // Không có lời khuyên cụ thể
        }
        
        return new SymptomCheckResponse(
                "Other",
                "Low",
                advice,
                reason,
                homeRemedies
        );
    }

    private SymptomCheckResponse createFallbackResponse(String userInput, Exception error) {
        logger.error("Tạo fallback response do lỗi: {}", error.getMessage());
        
        // Phân tích input để tạo response phù hợp
        String lowerInput = userInput.toLowerCase().trim();
        
        // Phát hiện câu chào hỏi
        boolean isGreeting = lowerInput.equals("xin chào") || 
                            lowerInput.equals("hello") || 
                            lowerInput.equals("chào") ||
                            lowerInput.equals("chào bạn") ||
                            lowerInput.startsWith("xin chào") ||
                            lowerInput.startsWith("hello");
        
        boolean isQuestion = lowerInput.contains("nên") || lowerInput.contains("khám") || 
                            lowerInput.contains("khoa nào") || lowerInput.contains("bác sĩ");
        
        String advice;
        String reason;
        List<String> homeRemedies;
        
        if (isGreeting) {
            // Câu chào hỏi - trả lời tự nhiên
            advice = "Xin chào! Tôi là HealthAI, trợ lý sức khỏe thông minh của bạn. " +
                    "Tôi có thể giúp bạn phân tích triệu chứng và gợi ý chuyên khoa phù hợp. " +
                    "Bạn hãy mô tả triệu chứng hoặc đặt câu hỏi để tôi hỗ trợ bạn nhé!";
            reason = "";
            homeRemedies = new ArrayList<>();
        } else if (isQuestion) {
            advice = "Xin lỗi, tôi gặp một chút khó khăn trong việc xử lý câu hỏi của bạn. " +
                    "Bạn có thể mô tả rõ hơn về các triệu chứng hoặc vấn đề sức khỏe bạn đang gặp phải không? " +
                    "Tôi sẽ cố gắng tư vấn và gợi ý chuyên khoa phù hợp cho bạn.";
            reason = "Hệ thống đang gặp sự cố kỹ thuật.";
            homeRemedies = Arrays.asList(
                    "Thử lại sau vài phút.",
                    "Mô tả lại vấn đề một cách chi tiết hơn."
            );
        } else {
            advice = "Xin lỗi, hệ thống đang gặp sự cố kỹ thuật tạm thời. " +
                    "Vui lòng thử lại sau một chút. Nếu vấn đề vẫn tiếp tục, " +
                    "bạn có thể liên hệ trực tiếp với bác sĩ hoặc mô tả lại triệu chứng của bạn.";
            reason = "Hệ thống đang gặp sự cố kỹ thuật.";
            homeRemedies = Arrays.asList(
                    "Thử lại sau vài phút.",
                    "Kiểm tra kết nối mạng của bạn."
            );
        }
        
        return new SymptomCheckResponse(
                "Other",
                "Low",
                advice,
                reason,
                homeRemedies
        );
    }
}