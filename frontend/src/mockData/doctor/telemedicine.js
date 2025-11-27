// Telemedicine / Video Call - Mock Data

export const videoSessions = [
  {
    id: "session_001",
    appointmentId: "apt_001",
    doctorId: "doc_001",
    doctorName: "BS. Nguyễn Văn A",
    patientId: "user_001",
    patientName: "Nguyễn Văn B",
    scheduledTime: "2024-01-15T14:00:00Z",
    startTime: "2024-01-15T14:02:00Z",
    endTime: "2024-01-15T14:35:00Z",
    duration: 33, // minutes
    status: "completed", // scheduled | in-progress | completed | cancelled
    roomId: "room_abc123",
    recordingUrl: "https://storage.example.com/recordings/session_001.mp4",
    sharedFiles: [
      {
        id: "file_001",
        name: "X-quang ngực",
        type: "xray",
        url: "https://storage.example.com/xray_001.jpg",
        sharedBy: "doctor",
        sharedAt: "2024-01-15T14:15:00Z"
      },
      {
        id: "file_002",
        name: "Kết quả xét nghiệm máu",
        type: "lab_result",
        url: "https://storage.example.com/lab_001.pdf",
        sharedBy: "patient",
        sharedAt: "2024-01-15T14:20:00Z"
      }
    ],
    notes: "Bệnh nhân ho khan, sốt nhẹ. Đã kê đơn thuốc.",
    prescriptionId: "pres_001",
    quality: "hd", // sd | hd | fullhd
    connectionQuality: "excellent" // poor | fair | good | excellent
  },
  {
    id: "session_002",
    appointmentId: "apt_002",
    doctorId: "doc_002",
    doctorName: "BS. Trần Thị B",
    patientId: "user_002",
    patientName: "Trần Thị C",
    scheduledTime: "2024-01-16T10:00:00Z",
    startTime: null,
    endTime: null,
    status: "scheduled",
    roomId: "room_def456"
  },
  {
    id: "session_003",
    appointmentId: "apt_003",
    doctorId: "doc_001",
    doctorName: "BS. Nguyễn Văn A",
    patientId: "user_003",
    patientName: "Lê Văn D",
    scheduledTime: "2024-01-15T15:00:00Z",
    startTime: "2024-01-15T15:00:00Z",
    endTime: null,
    status: "in-progress",
    roomId: "room_ghi789"
  }
];

export const videoSettings = {
  quality: "hd", // sd | hd | fullhd
  enableRecording: true,
  enableScreenShare: true,
  maxDuration: 60, // minutes
  autoRecord: false,
  requireConsent: true
};

export const videoCallHistory = [
  {
    sessionId: "session_001",
    date: "2024-01-15",
    duration: 33,
    doctorName: "BS. Nguyễn Văn A",
    patientName: "Nguyễn Văn B",
    status: "completed",
    hasRecording: true
  },
  {
    sessionId: "session_004",
    date: "2024-01-10",
    duration: 25,
    doctorName: "BS. Nguyễn Văn A",
    patientName: "Phạm Thị E",
    status: "completed",
    hasRecording: false
  }
];

