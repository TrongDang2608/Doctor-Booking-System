// CRM Marketing Automation - Mock Data

export const campaigns = [
  {
    id: "campaign_001",
    name: "Chúc mừng sinh nhật + Voucher",
    type: "birthday",
    trigger: "birthday",
    template: {
      subject: "Chúc mừng sinh nhật! Nhận ngay voucher 20%",
      message: "Chúc bạn sinh nhật vui vẻ! Tặng bạn voucher giảm 20% cho gói khám tổng quát.",
      voucherCode: "BIRTHDAY20",
      voucherDiscount: 20
    },
    status: "active",
    sentCount: 1250,
    openedCount: 890,
    clickedCount: 320,
    convertedCount: 150,
    conversionRate: 12.0 // percentage
  },
  {
    id: "campaign_002",
    name: "Nhắc nhở tái khám sau 6 tháng",
    type: "recheck_reminder",
    trigger: "last_appointment_6_months_ago",
    template: {
      subject: "Đã đến lúc kiểm tra sức khỏe định kỳ",
      message: "Bạn đã 6 tháng chưa khám lại. Đặt lịch ngay để đảm bảo sức khỏe tốt nhất!",
      voucherCode: "RECHECK10",
      voucherDiscount: 10
    },
    status: "active",
    sentCount: 3200,
    openedCount: 2100,
    clickedCount: 850,
    convertedCount: 420,
    conversionRate: 13.1
  },
  {
    id: "campaign_003",
    name: "Khuyến mãi dịp Tết",
    type: "seasonal",
    trigger: "manual",
    template: {
      subject: "Chúc mừng năm mới - Ưu đãi đặc biệt",
      message: "Nhân dịp năm mới, giảm 15% cho tất cả các dịch vụ khám bệnh.",
      voucherCode: "TET2024",
      voucherDiscount: 15
    },
    status: "completed",
    sentCount: 5000,
    openedCount: 3500,
    clickedCount: 1800,
    convertedCount: 900,
    conversionRate: 18.0
  }
];

export const automatedMessages = [
  {
    id: "msg_001",
    patientId: "user_001",
    patientName: "Nguyễn Văn A",
    type: "birthday",
    channel: "email",
    sentAt: "2024-01-15T09:00:00Z",
    status: "sent",
    opened: true,
    openedAt: "2024-01-15T10:30:00Z",
    clicked: true,
    clickedAt: "2024-01-15T10:35:00Z",
    converted: false
  },
  {
    id: "msg_002",
    patientId: "user_002",
    patientName: "Trần Thị B",
    type: "recheck_reminder",
    channel: "sms",
    sentAt: "2024-01-14T08:00:00Z",
    status: "sent",
    opened: true,
    openedAt: "2024-01-14T08:05:00Z",
    clicked: true,
    clickedAt: "2024-01-14T08:10:00Z",
    converted: true,
    convertedAt: "2024-01-14T10:00:00Z"
  }
];

export const patientSegments = [
  {
    id: "segment_001",
    name: "Bệnh nhân chưa quay lại 6 tháng",
    criteria: {
      lastAppointment: { operator: "lt", value: "6 months ago" },
      totalAppointments: { operator: "gte", value: 1 }
    },
    count: 3200,
    campaigns: ["campaign_002"],
    description: "Bệnh nhân đã khám ít nhất 1 lần nhưng chưa quay lại trong 6 tháng"
  },
  {
    id: "segment_002",
    name: "Bệnh nhân VIP (5+ lần khám)",
    criteria: {
      totalAppointments: { operator: "gte", value: 5 },
      totalSpent: { operator: "gte", value: 5000000 }
    },
    count: 850,
    campaigns: ["campaign_003"],
    description: "Bệnh nhân trung thành với 5+ lần khám và chi tiêu trên 5 triệu"
  },
  {
    id: "segment_003",
    name: "Bệnh nhân mới (chưa khám lần nào)",
    criteria: {
      totalAppointments: { operator: "eq", value: 0 },
      registeredDate: { operator: "gte", value: "30 days ago" }
    },
    count: 450,
    campaigns: ["campaign_001"],
    description: "Người dùng mới đăng ký trong 30 ngày nhưng chưa đặt lịch"
  },
  {
    id: "segment_004",
    name: "Bệnh nhân có ngày sinh trong tháng",
    criteria: {
      birthdayMonth: { operator: "eq", value: "current_month" }
    },
    count: 1250,
    campaigns: ["campaign_001"],
    description: "Bệnh nhân có sinh nhật trong tháng hiện tại"
  }
];

export const emailTemplates = [
  {
    id: "template_001",
    name: "Sinh nhật",
    subject: "Chúc mừng sinh nhật! Nhận ngay voucher {{discount}}%",
    body: `
      <p>Xin chào {{patientName}},</p>
      <p>Chúc mừng sinh nhật! Chúng tôi xin tặng bạn voucher giảm {{discount}}% cho gói khám tổng quát.</p>
      <p>Mã voucher: <strong>{{voucherCode}}</strong></p>
      <p>Voucher có hiệu lực đến {{expiryDate}}.</p>
      <p>Chúc bạn có một ngày sinh nhật vui vẻ và sức khỏe dồi dào!</p>
    `,
    variables: ["patientName", "voucherCode", "discount", "expiryDate"]
  },
  {
    id: "template_002",
    name: "Nhắc nhở tái khám",
    subject: "Đã đến lúc kiểm tra sức khỏe định kỳ",
    body: `
      <p>Xin chào {{patientName}},</p>
      <p>Bạn đã {{monthsSinceLastVisit}} tháng chưa khám lại. Đặt lịch ngay để đảm bảo sức khỏe tốt nhất!</p>
      <p>Chúng tôi tặng bạn voucher giảm {{discount}}% cho lần khám này.</p>
      <p>Mã voucher: <strong>{{voucherCode}}</strong></p>
    `,
    variables: ["patientName", "monthsSinceLastVisit", "voucherCode", "discount"]
  }
];

export const smsTemplates = [
  {
    id: "sms_template_001",
    name: "Nhắc nhở lịch hẹn",
    message: "Xin chào {{patientName}}, bạn có lịch hẹn với {{doctorName}} vào {{appointmentDate}} lúc {{appointmentTime}}. Vui lòng có mặt trước 15 phút."
  },
  {
    id: "sms_template_002",
    name: "Nhắc nhở tái khám",
    message: "Xin chào {{patientName}}, đã đến lúc tái khám. Đặt lịch ngay để nhận voucher giảm {{discount}}%: {{voucherCode}}"
  }
];

