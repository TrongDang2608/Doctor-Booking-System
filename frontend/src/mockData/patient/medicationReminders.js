// Medication Reminder & Auto Recheck - Mock Data

export const reminders = [
  {
    id: "reminder_001",
    userId: "user_001",
    memberId: "member_002", // null if for self
    memberName: "Nguyễn Thị B",
    prescriptionId: "pres_001",
    medicationName: "Paracetamol 500mg",
    dosage: "1 viên",
    frequency: "3 lần/ngày",
    times: ["08:00", "14:00", "20:00"],
    startDate: "2024-01-15",
    endDate: "2024-01-20",
    status: "active", // active | completed | skipped
    nextReminder: "2024-01-15T14:00:00Z",
    notificationMethod: ["push", "sms"], // push | sms | zalo | email
    completedDoses: [
      {
        date: "2024-01-15",
        time: "08:00",
        status: "taken", // taken | missed | skipped
        timestamp: "2024-01-15T08:05:00Z"
      }
    ]
  },
  {
    id: "reminder_002",
    userId: "user_001",
    memberId: null,
    memberName: "Nguyễn Văn A",
    prescriptionId: "pres_002",
    medicationName: "Omeprazole 20mg",
    dosage: "1 viên",
    frequency: "1 lần/ngày",
    times: ["07:00"],
    startDate: "2024-01-10",
    endDate: "2024-01-24",
    status: "active",
    nextReminder: "2024-01-16T07:00:00Z",
    notificationMethod: ["push", "email"],
    completedDoses: [
      { date: "2024-01-15", time: "07:00", status: "taken", timestamp: "2024-01-15T07:02:00Z" },
      { date: "2024-01-14", time: "07:00", status: "taken", timestamp: "2024-01-14T07:01:00Z" },
      { date: "2024-01-13", time: "07:00", status: "missed", timestamp: null }
    ]
  }
];

export const recheckAppointments = [
  {
    id: "recheck_001",
    originalAppointmentId: "apt_001",
    originalDate: "2024-01-10",
    suggestedDate: "2024-02-10",
    reason: "Tái khám sau 1 tháng",
    status: "pending", // pending | scheduled | completed
    autoCreated: true,
    createdAt: "2024-01-10T10:00:00Z"
  },
  {
    id: "recheck_002",
    originalAppointmentId: "apt_002",
    originalDate: "2024-01-05",
    suggestedDate: "2024-01-19",
    reason: "Tái khám sau 2 tuần",
    status: "scheduled",
    autoCreated: true,
    scheduledAppointmentId: "apt_010",
    createdAt: "2024-01-05T11:00:00Z"
  }
];

export const medicationHistory = [
  {
    prescriptionId: "pres_001",
    medicationName: "Paracetamol 500mg",
    totalDoses: 15,
    takenDoses: 12,
    missedDoses: 3,
    adherenceRate: 80, // percentage
    startDate: "2024-01-15",
    endDate: "2024-01-20"
  },
  {
    prescriptionId: "pres_002",
    medicationName: "Omeprazole 20mg",
    totalDoses: 14,
    takenDoses: 13,
    missedDoses: 1,
    adherenceRate: 93,
    startDate: "2024-01-10",
    endDate: "2024-01-24"
  }
];

export const reminderSettings = {
  userId: "user_001",
  defaultNotificationMethods: ["push", "sms"],
  reminderBeforeMinutes: 15, // Remind 15 minutes before
  allowSnooze: true,
  maxSnoozeCount: 3,
  enableMissedDoseAlert: true,
  enableWeeklyReport: true
};


