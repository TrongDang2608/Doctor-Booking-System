// Mock Data Index - Export all mock data

// Patient Mock Data
export * from './patient/aiSymptomChecker';
export * from './patient/healthWallet';
export * from './patient/familyAccounts';
export * from './patient/medicationReminders';

// Doctor Mock Data
export * from './doctor/prescriptions';
export * from './doctor/smartCalendar';
export * from './doctor/telemedicine';
export * from './doctor/remoteMonitoring';

// Admin Mock Data
export * from './admin/businessIntelligence';

// Re-export for convenience
export { symptoms, chatHistory, symptomPatterns, specialtyMapping } from './patient/aiSymptomChecker';
export { walletData, vouchers, loyaltyTiers, pointHistory } from './patient/healthWallet';
export { familyAccountData, relationshipTypes, familyMemberTemplates } from './patient/familyAccounts';
export { reminders, recheckAppointments, medicationHistory, reminderSettings } from './patient/medicationReminders';
export { clinics, appointmentNavigation } from './patient/clinicMap';
export { prescriptionTemplates, prescriptions, medicationDatabase } from './doctor/prescriptions';
export { calendarSettings, availability, timeOff, googleCalendarSync, appointmentStats } from './doctor/smartCalendar';
export { videoSessions, videoSettings, videoCallHistory } from './doctor/telemedicine';
export { monitoringPlans, patientReadings, alerts, charts } from './doctor/remoteMonitoring';
export { overview, peakHours, specialtyPerformance, doctorPerformance, revenueByPeriod, patientAnalytics, appointmentAnalytics } from './admin/businessIntelligence';
export { campaigns, automatedMessages, patientSegments, emailTemplates, smsTemplates } from './admin/crmMarketing';
export { medications, stockMovements, alerts as inventoryAlerts, suppliers, inventoryStats } from './admin/inventory';
export { questions, blogPosts, moderationQueue, moderationRules, moderationStats } from './admin/contentModeration';

