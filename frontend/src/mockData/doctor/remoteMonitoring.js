// Remote Monitoring - Mock Data

export const monitoringPlans = [
  {
    id: "plan_001",
    doctorId: "doc_001",
    doctorName: "BS. Nguyễn Văn A",
    patientId: "user_001",
    patientName: "Nguyễn Văn B",
    condition: "Tăng huyết áp",
    startDate: "2024-01-01",
    endDate: "2024-02-01",
    metrics: [
      {
        type: "blood_pressure",
        name: "Huyết áp",
        unit: "mmHg",
        frequency: "daily", // daily | twice_daily | weekly
        targetRange: {
          systolic: { min: 90, max: 140 },
          diastolic: { min: 60, max: 90 }
        },
        alertThreshold: {
          systolic: { min: 80, max: 160 },
          diastolic: { min: 50, max: 100 }
        }
      },
      {
        type: "heart_rate",
        name: "Nhịp tim",
        unit: "bpm",
        frequency: "daily",
        targetRange: { min: 60, max: 100 },
        alertThreshold: { min: 50, max: 120 }
      }
    ],
    status: "active"
  },
  {
    id: "plan_002",
    doctorId: "doc_002",
    doctorName: "BS. Trần Thị B",
    patientId: "user_002",
    patientName: "Trần Thị C",
    condition: "Tiểu đường",
    startDate: "2024-01-05",
    endDate: "2024-02-05",
    metrics: [
      {
        type: "blood_sugar",
        name: "Đường huyết",
        unit: "mg/dL",
        frequency: "twice_daily",
        targetRange: { min: 70, max: 100 },
        alertThreshold: { min: 60, max: 140 }
      },
      {
        type: "weight",
        name: "Cân nặng",
        unit: "kg",
        frequency: "weekly",
        targetRange: { min: 55, max: 65 },
        alertThreshold: { min: 50, max: 70 }
      }
    ],
    status: "active"
  }
];

export const patientReadings = [
  {
    id: "reading_001",
    planId: "plan_001",
    patientId: "user_001",
    date: "2024-01-15",
    time: "08:00",
    metricType: "blood_pressure",
    value: {
      systolic: 135,
      diastolic: 85
    },
    status: "normal", // normal | warning | critical
    notes: "Đo sau khi thức dậy",
    device: "Omron HEM-7130"
  },
  {
    id: "reading_002",
    planId: "plan_001",
    patientId: "user_001",
    date: "2024-01-15",
    time: "20:00",
    metricType: "blood_pressure",
    value: {
      systolic: 145,
      diastolic: 95
    },
    status: "warning",
    alertSent: true,
    alertTime: "2024-01-15T20:05:00Z",
    notes: "Huyết áp tăng nhẹ"
  },
  {
    id: "reading_003",
    planId: "plan_002",
    patientId: "user_002",
    date: "2024-01-15",
    time: "07:00",
    metricType: "blood_sugar",
    value: 95,
    status: "normal",
    notes: "Đo trước ăn sáng"
  },
  {
    id: "reading_004",
    planId: "plan_002",
    patientId: "user_002",
    date: "2024-01-15",
    time: "14:00",
    metricType: "blood_sugar",
    value: 150,
    status: "warning",
    alertSent: true,
    notes: "Đo sau ăn trưa 2 giờ"
  }
];

export const alerts = [
  {
    id: "alert_001",
    planId: "plan_001",
    patientId: "user_001",
    type: "critical",
    metric: "blood_pressure",
    value: { systolic: 180, diastolic: 110 },
    message: "Huyết áp vượt ngưỡng nguy hiểm!",
    timestamp: "2024-01-14T20:00:00Z",
    doctorNotified: true,
    doctorNotifiedAt: "2024-01-14T20:01:00Z",
    actionRequired: true,
    actionTaken: "Đã gọi điện cho bệnh nhân, hướng dẫn đến cấp cứu"
  },
  {
    id: "alert_002",
    planId: "plan_002",
    patientId: "user_002",
    type: "warning",
    metric: "blood_sugar",
    value: 160,
    message: "Đường huyết cao, cần theo dõi",
    timestamp: "2024-01-15T14:00:00Z",
    doctorNotified: false,
    actionRequired: false
  }
];

export const charts = {
  bloodPressure: [
    { date: "2024-01-01", systolic: 130, diastolic: 80 },
    { date: "2024-01-02", systolic: 135, diastolic: 85 },
    { date: "2024-01-03", systolic: 132, diastolic: 82 },
    { date: "2024-01-04", systolic: 138, diastolic: 88 },
    { date: "2024-01-05", systolic: 140, diastolic: 90 },
    { date: "2024-01-06", systolic: 135, diastolic: 85 },
    { date: "2024-01-07", systolic: 133, diastolic: 83 },
    { date: "2024-01-08", systolic: 137, diastolic: 87 },
    { date: "2024-01-09", systolic: 139, diastolic: 89 },
    { date: "2024-01-10", systolic: 136, diastolic: 86 },
    { date: "2024-01-11", systolic: 134, diastolic: 84 },
    { date: "2024-01-12", systolic: 141, diastolic: 91 },
    { date: "2024-01-13", systolic: 138, diastolic: 88 },
    { date: "2024-01-14", systolic: 145, diastolic: 95 },
    { date: "2024-01-15", systolic: 135, diastolic: 85 }
  ],
  bloodSugar: [
    { date: "2024-01-05", morning: 95, evening: 120 },
    { date: "2024-01-06", morning: 92, evening: 115 },
    { date: "2024-01-07", morning: 98, evening: 125 },
    { date: "2024-01-08", morning: 90, evening: 118 },
    { date: "2024-01-09", morning: 94, evening: 122 },
    { date: "2024-01-10", morning: 96, evening: 128 },
    { date: "2024-01-11", morning: 93, evening: 120 },
    { date: "2024-01-12", morning: 97, evening: 124 },
    { date: "2024-01-13", morning: 91, evening: 119 },
    { date: "2024-01-14", morning: 95, evening: 123 },
    { date: "2024-01-15", morning: 95, evening: 150 }
  ]
};

