package com.doctorbooking.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SymptomCheckResponse {
    private String suggestedSpecialization; // Chuyên khoa AI gợi ý
    private String riskLevel;               // Mức độ rủi ro (Low/Medium/High)
    private String advice;                  // Lời khuyên
    private String reason;                  // Lý do tại sao gợi ý vậy
    private List<String> homeRemedies;           // Hướng dẫn giảm đau tại nhà
}