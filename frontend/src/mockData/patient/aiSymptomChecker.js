// AI Symptom Checker / Triage Bot - Mock Data

export const symptoms = [
  {
    id: "sym_001",
    name: "Đau bụng dưới bên phải",
    category: "Tiêu hóa",
    severity: "high",
    relatedSymptoms: ["sốt", "buồn nôn", "chán ăn"],
    suggestedSpecialties: ["Tiêu hóa", "Ngoại khoa"],
    urgency: "urgent",
    aiResponse: "Có nguy cơ viêm ruột thừa, bạn nên đặt lịch với Bác sĩ Tiêu hóa hoặc đến cấp cứu ngay."
  },
  {
    id: "sym_002",
    name: "Đau đầu dữ dội",
    category: "Thần kinh",
    severity: "high",
    relatedSymptoms: ["buồn nôn", "nhạy cảm ánh sáng"],
    suggestedSpecialties: ["Thần kinh"],
    urgency: "urgent",
    aiResponse: "Đau đầu dữ dội kèm buồn nôn có thể là dấu hiệu nghiêm trọng. Nên khám Bác sĩ Thần kinh sớm."
  },
  {
    id: "sym_003",
    name: "Sốt cao trên 39 độ",
    category: "Tổng quát",
    severity: "high",
    relatedSymptoms: ["ớn lạnh", "mệt mỏi"],
    suggestedSpecialties: ["Nhi khoa", "Nội tổng quát"],
    urgency: "urgent",
    aiResponse: "Sốt cao trên 39 độ cần được theo dõi. Nếu kèm co giật hoặc khó thở, nên đến cấp cứu ngay."
  },
  {
    id: "sym_004",
    name: "Ho khan kéo dài",
    category: "Hô hấp",
    severity: "medium",
    relatedSymptoms: ["đau họng", "khàn tiếng"],
    suggestedSpecialties: ["Hô hấp", "Tai mũi họng"],
    urgency: "normal",
    aiResponse: "Ho khan kéo dài có thể do nhiều nguyên nhân. Nên khám Bác sĩ Hô hấp để được chẩn đoán chính xác."
  },
  {
    id: "sym_005",
    name: "Đau răng",
    category: "Răng hàm mặt",
    severity: "medium",
    relatedSymptoms: ["sưng nướu", "nhạy cảm với lạnh/nóng"],
    suggestedSpecialties: ["Răng hàm mặt"],
    urgency: "normal",
    aiResponse: "Đau răng có thể do sâu răng hoặc viêm nướu. Nên khám Bác sĩ Răng hàm mặt để điều trị kịp thời."
  }
];

export const chatHistory = [
  {
    id: "msg_001",
    type: "user",
    message: "Tôi bị đau bụng dưới bên phải, sốt nhẹ",
    timestamp: "2024-01-15T10:30:00Z",
    symptoms: ["Đau bụng dưới bên phải", "Sốt nhẹ"]
  },
  {
    id: "msg_002",
    type: "bot",
    message: "Có nguy cơ viêm ruột thừa, bạn nên đặt lịch với Bác sĩ Tiêu hóa hoặc đến cấp cứu ngay.",
    recommendations: [
      {
        specialty: "Tiêu hóa",
        urgency: "urgent",
        action: "Đặt lịch ngay"
      },
      {
        specialty: "Cấp cứu",
        urgency: "emergency",
        action: "Đến bệnh viện ngay"
      }
    ],
    timestamp: "2024-01-15T10:30:05Z"
  },
  {
    id: "msg_003",
    type: "user",
    message: "Có thể đợi đến ngày mai không?",
    timestamp: "2024-01-15T10:31:00Z"
  },
  {
    id: "msg_004",
    type: "bot",
    message: "Không nên đợi. Viêm ruột thừa có thể diễn biến nhanh và nguy hiểm. Nên đến cấp cứu ngay để được kiểm tra.",
    recommendations: [
      {
        specialty: "Cấp cứu",
        urgency: "emergency",
        action: "Đến bệnh viện ngay lập tức"
      }
    ],
    timestamp: "2024-01-15T10:31:05Z"
  }
];

export const symptomPatterns = [
  {
    pattern: ["đau bụng", "sốt", "buồn nôn"],
    possibleConditions: ["Viêm ruột thừa", "Viêm dạ dày", "Viêm tụy"],
    recommendedAction: "Khám Tiêu hóa hoặc Cấp cứu",
    urgency: "urgent"
  },
  {
    pattern: ["đau đầu", "buồn nôn", "nhạy cảm ánh sáng"],
    possibleConditions: ["Đau nửa đầu", "Viêm màng não"],
    recommendedAction: "Khám Thần kinh",
    urgency: "urgent"
  },
  {
    pattern: ["ho", "sốt", "đau họng"],
    possibleConditions: ["Cảm cúm", "Viêm họng", "Viêm phế quản"],
    recommendedAction: "Khám Hô hấp hoặc Tai mũi họng",
    urgency: "normal"
  },
  {
    pattern: ["đau răng", "sưng nướu"],
    possibleConditions: ["Sâu răng", "Viêm nướu", "Áp xe răng"],
    recommendedAction: "Khám Răng hàm mặt",
    urgency: "normal"
  }
];

export const specialtyMapping = {
  "Tiêu hóa": ["đau bụng", "buồn nôn", "nôn", "tiêu chảy", "táo bón"],
  "Thần kinh": ["đau đầu", "chóng mặt", "co giật", "tê bì"],
  "Hô hấp": ["ho", "khó thở", "đau ngực", "thở khò khè"],
  "Tim mạch": ["đau ngực", "khó thở", "hồi hộp", "tức ngực"],
  "Nhi khoa": ["sốt", "ho", "nôn", "tiêu chảy"],
  "Răng hàm mặt": ["đau răng", "sưng nướu", "chảy máu chân răng"],
  "Da liễu": ["phát ban", "ngứa", "mụn", "nốt đỏ"],
  "Tai mũi họng": ["đau họng", "nghẹt mũi", "đau tai", "chảy mũi"]
};


