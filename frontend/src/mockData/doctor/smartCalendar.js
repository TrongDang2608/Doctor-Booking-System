// Smart Calendar - Mock Data

export const calendarSettings = {
  doctorId: "doc_001",
  doctorName: "BS. Nguyễn Văn A",
  workingHours: {
    monday: { start: "08:00", end: "17:00", available: true },
    tuesday: { start: "08:00", end: "17:00", available: true },
    wednesday: { start: "08:00", end: "12:00", available: true },
    thursday: { start: "08:00", end: "17:00", available: true },
    friday: { start: "08:00", end: "17:00", available: true },
    saturday: { start: "08:00", end: "12:00", available: true },
    sunday: { available: false }
  },
  slotDuration: 30, // minutes
  bufferTime: 15, // minutes between appointments
  maxAppointmentsPerDay: 20,
  breakTimes: [
    { start: "12:00", end: "13:00", type: "lunch", name: "Nghỉ trưa" }
  ]
};

export const availability = [
  {
    date: "2024-01-15",
    slots: [
      { time: "08:00", status: "booked", appointmentId: "apt_001", patientName: "Nguyễn Văn B" },
      { time: "08:30", status: "available" },
      { time: "09:00", status: "available" },
      { time: "09:30", status: "booked", appointmentId: "apt_002", patientName: "Trần Thị C" },
      { time: "10:00", status: "buffer" }, // buffer time
      { time: "10:15", status: "available" },
      { time: "10:45", status: "available" },
      { time: "11:15", status: "booked", appointmentId: "apt_003", patientName: "Lê Văn D" },
      { time: "11:45", status: "available" },
      { time: "12:00", status: "break", type: "lunch" },
      { time: "13:00", status: "available" },
      { time: "13:30", status: "available" },
      { time: "14:00", status: "booked", appointmentId: "apt_004", patientName: "Phạm Thị E" },
      { time: "14:30", status: "available" },
      { time: "15:00", status: "booked", appointmentId: "apt_005", patientName: "Hoàng Văn F" },
      { time: "15:30", status: "available" },
      { time: "16:00", status: "available" },
      { time: "16:30", status: "booked", appointmentId: "apt_006", patientName: "Vũ Thị G" }
    ]
  },
  {
    date: "2024-01-16",
    slots: [
      { time: "08:00", status: "available" },
      { time: "08:30", status: "available" },
      { time: "09:00", status: "booked", appointmentId: "apt_007", patientName: "Đặng Văn H" },
      { time: "09:30", status: "available" },
      { time: "10:00", status: "available" },
      { time: "10:30", status: "available" },
      { time: "11:00", status: "available" },
      { time: "11:30", status: "available" },
      { time: "12:00", status: "break", type: "lunch" },
      { time: "13:00", status: "available" },
      { time: "13:30", status: "available" },
      { time: "14:00", status: "available" },
      { time: "14:30", status: "available" },
      { time: "15:00", status: "available" },
      { time: "15:30", status: "available" },
      { time: "16:00", status: "available" },
      { time: "16:30", status: "available" }
    ]
  }
];

export const timeOff = [
  {
    id: "timeoff_001",
    doctorId: "doc_001",
    startDate: "2024-01-20",
    endDate: "2024-01-25",
    reason: "Nghỉ phép",
    status: "approved",
    requestedAt: "2024-01-10T10:00:00Z",
    approvedAt: "2024-01-10T14:30:00Z",
    approvedBy: "admin_001"
  },
  {
    id: "timeoff_002",
    doctorId: "doc_001",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    reason: "Nghỉ lễ Tết",
    status: "pending",
    requestedAt: "2024-01-15T09:00:00Z"
  }
];

export const googleCalendarSync = {
  enabled: true,
  calendarId: "doc_001@google.com",
  lastSync: "2024-01-15T10:00:00Z",
  syncDirection: "bidirectional", // one-way | bidirectional
  syncFrequency: "realtime" // realtime | hourly | daily
};

export const appointmentStats = {
  today: {
    total: 8,
    completed: 5,
    upcoming: 3,
    cancelled: 0
  },
  thisWeek: {
    total: 45,
    completed: 32,
    upcoming: 13,
    cancelled: 0
  },
  thisMonth: {
    total: 180,
    completed: 150,
    upcoming: 30,
    cancelled: 0
  },
  averageDuration: 25, // minutes
  peakHours: ["09:00", "10:00", "14:00", "15:00"]
};


