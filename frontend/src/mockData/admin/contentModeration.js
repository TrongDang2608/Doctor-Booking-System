// Content Moderation (Blog/Q&A) - Mock Data

export const questions = [
  {
    id: "q_001",
    patientId: "user_001",
    patientName: "Nguyễn Văn A",
    title: "Đau đầu thường xuyên nên khám ở đâu?",
    content: "Tôi bị đau đầu thường xuyên vào buổi sáng, đã uống thuốc giảm đau nhưng không khỏi. Có ai biết nên khám ở chuyên khoa nào không?",
    category: "Thần kinh",
    tags: ["đau đầu", "thần kinh", "sức khỏe"],
    status: "pending", // pending | approved | assigned | answered | rejected
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    assignedTo: null, // doctorId
    assignedAt: null,
    answer: null,
    views: 45,
    likes: 3
  },
  {
    id: "q_002",
    patientId: "user_002",
    patientName: "Trần Thị B",
    title: "Trẻ 2 tuổi sốt cao phải làm sao?",
    content: "Con tôi 2 tuổi, sốt 39 độ, đã uống hạ sốt nhưng không giảm. Có cần đưa đến bệnh viện ngay không?",
    category: "Nhi khoa",
    tags: ["trẻ em", "sốt", "nhi khoa"],
    status: "assigned",
    createdAt: "2024-01-14T15:30:00Z",
    updatedAt: "2024-01-14T16:00:00Z",
    assignedTo: "doc_005",
    assignedDoctorName: "BS. Trần Thị C",
    assignedAt: "2024-01-14T16:00:00Z",
    answer: {
      doctorId: "doc_005",
      doctorName: "BS. Trần Thị C",
      content: "Với trẻ 2 tuổi sốt 39 độ, bạn nên đưa trẻ đến cấp cứu ngay, đặc biệt nếu kèm các dấu hiệu như co giật, khó thở, hoặc trẻ li bì. Hạ sốt tại nhà chỉ là biện pháp tạm thời.",
      answeredAt: "2024-01-15T14:30:00Z",
      helpful: 12,
      notHelpful: 1
    },
    views: 120,
    likes: 8
  },
  {
    id: "q_003",
    patientId: "user_003",
    patientName: "Lê Văn C",
    title: "Đau răng có thể tự khỏi không?",
    content: "Tôi bị đau răng 2 ngày rồi, có thể đợi tự khỏi không hay phải đi khám?",
    category: "Răng hàm mặt",
    tags: ["đau răng", "răng hàm mặt"],
    status: "answered",
    createdAt: "2024-01-13T09:00:00Z",
    updatedAt: "2024-01-13T11:00:00Z",
    assignedTo: "doc_006",
    assignedDoctorName: "BS. Phạm Văn D",
    assignedAt: "2024-01-13T09:30:00Z",
    answer: {
      doctorId: "doc_006",
      doctorName: "BS. Phạm Văn D",
      content: "Đau răng thường không tự khỏi, đặc biệt nếu do sâu răng hoặc viêm. Bạn nên đi khám sớm để được điều trị kịp thời, tránh biến chứng.",
      answeredAt: "2024-01-13T11:00:00Z",
      helpful: 25,
      notHelpful: 2
    },
    views: 89,
    likes: 15
  }
];

export const blogPosts = [
  {
    id: "blog_001",
    title: "10 dấu hiệu cảnh báo bệnh tim mạch",
    author: "BS. Nguyễn Văn A",
    authorId: "doc_001",
    content: "Bệnh tim mạch là một trong những nguyên nhân hàng đầu gây tử vong...",
    excerpt: "Nhận biết sớm các dấu hiệu cảnh báo bệnh tim mạch có thể giúp bạn phòng ngừa và điều trị kịp thời.",
    category: "Tim mạch",
    tags: ["tim mạch", "sức khỏe", "phòng ngừa"],
    status: "published", // draft | pending | published | rejected
    publishedAt: "2024-01-10T09:00:00Z",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-10T09:00:00Z",
    featuredImage: "https://example.com/images/heart-health.jpg",
    views: 1250,
    likes: 89,
    comments: 12,
    readingTime: 5 // minutes
  },
  {
    id: "blog_002",
    title: "Cách chăm sóc trẻ bị sốt tại nhà",
    author: "BS. Trần Thị B",
    authorId: "doc_002",
    content: "Sốt là phản ứng tự nhiên của cơ thể khi chống lại nhiễm trùng...",
    excerpt: "Hướng dẫn chi tiết cách chăm sóc trẻ bị sốt tại nhà an toàn và hiệu quả.",
    category: "Nhi khoa",
    tags: ["nhi khoa", "sốt", "chăm sóc trẻ"],
    status: "published",
    publishedAt: "2024-01-12T08:00:00Z",
    createdAt: "2024-01-11T14:00:00Z",
    updatedAt: "2024-01-12T08:00:00Z",
    featuredImage: "https://example.com/images/fever-care.jpg",
    views: 890,
    likes: 65,
    comments: 8,
    readingTime: 7
  },
  {
    id: "blog_003",
    title: "Chế độ ăn uống cho người tiểu đường",
    author: "BS. Lê Văn C",
    authorId: "doc_003",
    content: "Chế độ ăn uống đóng vai trò quan trọng trong việc kiểm soát đường huyết...",
    excerpt: "Tìm hiểu về chế độ ăn uống phù hợp cho người bị tiểu đường.",
    category: "Nội tiết",
    tags: ["tiểu đường", "dinh dưỡng", "sức khỏe"],
    status: "draft",
    createdAt: "2024-01-14T10:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z"
  }
];

export const moderationQueue = [
  {
    id: "mod_001",
    contentId: "q_001",
    contentType: "question",
    flaggedReason: null, // spam | inappropriate | medical_advice | other
    flaggedBy: null,
    status: "pending_review",
    priority: "normal", // low | normal | high | urgent
    submittedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "mod_002",
    contentId: "q_004",
    contentType: "question",
    flaggedReason: "spam",
    flaggedBy: "system",
    status: "pending_review",
    priority: "high",
    submittedAt: "2024-01-15T11:00:00Z",
    flaggedContent: "Câu hỏi có chứa từ khóa spam"
  },
  {
    id: "mod_003",
    contentId: "blog_003",
    contentType: "blog",
    flaggedReason: null,
    flaggedBy: null,
    status: "pending_review",
    priority: "normal",
    submittedAt: "2024-01-14T10:00:00Z"
  }
];

export const moderationRules = [
  {
    id: "rule_001",
    name: "Tự động từ chối câu hỏi có từ khóa nhạy cảm",
    keywords: ["tự tử", "giết người", "bạo lực"],
    action: "auto_reject",
    enabled: true
  },
  {
    id: "rule_002",
    name: "Cảnh báo câu hỏi có từ khóa quảng cáo",
    keywords: ["mua", "bán", "giá rẻ", "khuyến mãi"],
    action: "flag_for_review",
    enabled: true
  },
  {
    id: "rule_003",
    name: "Tự động phê duyệt câu hỏi từ bệnh nhân đã xác thực",
    criteria: {
      patientVerified: true,
      totalAppointments: { operator: "gte", value: 1 }
    },
    action: "auto_approve",
    enabled: true
  }
];

export const moderationStats = {
  totalPending: 15,
  totalApproved: 1250,
  totalRejected: 45,
  totalFlagged: 8,
  averageReviewTime: 2.5 // hours
};

