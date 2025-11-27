// Business Intelligence Dashboard - Mock Data

export const overview = {
  totalPatients: 12500,
  totalDoctors: 150,
  totalAppointments: 45000,
  totalRevenue: 12500000000, // VNĐ
  period: "2024-01", // month
  growth: {
    patients: 12.5, // percentage
    appointments: 8.3,
    revenue: 15.2
  }
};

export const peakHours = [
  { hour: "08:00", appointments: 45, revenue: 13500000 },
  { hour: "09:00", appointments: 78, revenue: 23400000 },
  { hour: "10:00", appointments: 92, revenue: 27600000 },
  { hour: "11:00", appointments: 65, revenue: 19500000 },
  { hour: "12:00", appointments: 20, revenue: 6000000 },
  { hour: "13:00", appointments: 35, revenue: 10500000 },
  { hour: "14:00", appointments: 85, revenue: 25500000 },
  { hour: "15:00", appointments: 88, revenue: 26400000 },
  { hour: "16:00", appointments: 65, revenue: 19500000 },
  { hour: "17:00", appointments: 40, revenue: 12000000 }
];

export const specialtyPerformance = [
  {
    specialty: "Tim mạch",
    appointments: 3200,
    revenue: 960000000,
    avgRating: 4.8,
    returnRate: 65,
    avgWaitTime: 15 // minutes
  },
  {
    specialty: "Nhi khoa",
    appointments: 2800,
    revenue: 840000000,
    avgRating: 4.9,
    returnRate: 72,
    avgWaitTime: 12
  },
  {
    specialty: "Tiêu hóa",
    appointments: 2500,
    revenue: 750000000,
    avgRating: 4.7,
    returnRate: 58,
    avgWaitTime: 18
  },
  {
    specialty: "Da liễu",
    appointments: 1800,
    revenue: 540000000,
    avgRating: 4.6,
    returnRate: 55,
    avgWaitTime: 20
  },
  {
    specialty: "Răng hàm mặt",
    appointments: 2200,
    revenue: 880000000,
    avgRating: 4.8,
    returnRate: 68,
    avgWaitTime: 10
  }
];

export const doctorPerformance = [
  {
    doctorId: "doc_001",
    doctorName: "BS. Nguyễn Văn A",
    specialty: "Tim mạch",
    totalAppointments: 450,
    totalRevenue: 135000000,
    avgRating: 4.9,
    returnRate: 78,
    patientSatisfaction: 95,
    avgWaitTime: 10
  },
  {
    doctorId: "doc_002",
    doctorName: "BS. Trần Thị B",
    specialty: "Nhi khoa",
    totalAppointments: 520,
    totalRevenue: 156000000,
    avgRating: 4.95,
    returnRate: 82,
    patientSatisfaction: 98,
    avgWaitTime: 8
  },
  {
    doctorId: "doc_003",
    doctorName: "BS. Lê Văn C",
    specialty: "Tiêu hóa",
    totalAppointments: 380,
    totalRevenue: 114000000,
    avgRating: 4.7,
    returnRate: 65,
    patientSatisfaction: 88,
    avgWaitTime: 15
  }
];

export const revenueByPeriod = {
  daily: [
    { date: "2024-01-01", revenue: 45000000, appointments: 120 },
    { date: "2024-01-02", revenue: 52000000, appointments: 135 },
    { date: "2024-01-03", revenue: 48000000, appointments: 125 },
    { date: "2024-01-04", revenue: 55000000, appointments: 142 },
    { date: "2024-01-05", revenue: 51000000, appointments: 132 },
    { date: "2024-01-06", revenue: 47000000, appointments: 122 },
    { date: "2024-01-07", revenue: 43000000, appointments: 110 },
    { date: "2024-01-08", revenue: 56000000, appointments: 145 },
    { date: "2024-01-09", revenue: 54000000, appointments: 140 },
    { date: "2024-01-10", revenue: 52000000, appointments: 135 },
    { date: "2024-01-11", revenue: 50000000, appointments: 130 },
    { date: "2024-01-12", revenue: 48000000, appointments: 125 },
    { date: "2024-01-13", revenue: 46000000, appointments: 120 },
    { date: "2024-01-14", revenue: 49000000, appointments: 128 },
    { date: "2024-01-15", revenue: 53000000, appointments: 138 }
  ],
  weekly: [
    { week: "2024-W01", revenue: 350000000, appointments: 910 },
    { week: "2024-W02", revenue: 380000000, appointments: 990 },
    { week: "2024-W03", revenue: 370000000, appointments: 960 }
  ],
  monthly: [
    { month: "2024-01", revenue: 1250000000, appointments: 3250 },
    { month: "2023-12", revenue: 1180000000, appointments: 3070 },
    { month: "2023-11", revenue: 1150000000, appointments: 2990 }
  ]
};

export const patientAnalytics = {
  newPatients: 450,
  returningPatients: 3200,
  retentionRate: 87,
  avgAppointmentsPerPatient: 3.2,
  topPatientSegments: [
    { segment: "Người cao tuổi (60+)", count: 1800, percentage: 36 },
    { segment: "Trẻ em (0-12)", count: 1200, percentage: 24 },
    { segment: "Thanh niên (18-30)", count: 1000, percentage: 20 },
    { segment: "Trung niên (30-60)", count: 1000, percentage: 20 }
  ],
  patientLifetimeValue: 2500000, // VNĐ
  averageDaysBetweenVisits: 45
};

export const appointmentAnalytics = {
  cancellationRate: 5.2, // percentage
  noShowRate: 3.8,
  rescheduleRate: 8.5,
  averageBookingLeadTime: 3.5, // days
  mostPopularDays: ["Thứ 2", "Thứ 3", "Thứ 5"],
  leastPopularDays: ["Chủ nhật", "Thứ 7"]
};

