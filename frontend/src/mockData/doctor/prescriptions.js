// E-Prescription & Templates - Mock Data

export const prescriptionTemplates = [
  {
    id: "template_001",
    name: "Template Cảm cúm",
    specialty: "Nhi khoa",
    commonSymptoms: ["Sốt", "Ho", "Sổ mũi", "Đau họng"],
    medications: [
      {
        name: "Paracetamol 500mg",
        dosage: "1 viên",
        frequency: "3 lần/ngày",
        duration: "5 ngày",
        instructions: "Uống sau ăn",
        quantity: 15
      },
      {
        name: "Oresol",
        dosage: "1 gói",
        frequency: "2 lần/ngày",
        duration: "3 ngày",
        instructions: "Pha với 200ml nước",
        quantity: 6
      }
    ],
    notes: "Nghỉ ngơi, uống nhiều nước, tránh lạnh"
  },
  {
    id: "template_002",
    name: "Template Dạ dày",
    specialty: "Tiêu hóa",
    commonSymptoms: ["Đau bụng", "Ợ hơi", "Buồn nôn", "Đầy bụng"],
    medications: [
      {
        name: "Omeprazole 20mg",
        dosage: "1 viên",
        frequency: "1 lần/ngày",
        duration: "14 ngày",
        instructions: "Uống trước ăn sáng",
        quantity: 14
      },
      {
        name: "Domperidone 10mg",
        dosage: "1 viên",
        frequency: "3 lần/ngày",
        duration: "7 ngày",
        instructions: "Uống trước ăn 30 phút",
        quantity: 21
      }
    ],
    notes: "Tránh thức ăn cay, nóng, rượu bia"
  },
  {
    id: "template_003",
    name: "Template Tăng huyết áp",
    specialty: "Tim mạch",
    commonSymptoms: ["Đau đầu", "Chóng mặt", "Mệt mỏi"],
    medications: [
      {
        name: "Amlodipine 5mg",
        dosage: "1 viên",
        frequency: "1 lần/ngày",
        duration: "30 ngày",
        instructions: "Uống vào buổi sáng",
        quantity: 30
      }
    ],
    notes: "Đo huyết áp hàng ngày, tái khám sau 1 tháng"
  },
  {
    id: "template_004",
    name: "Template Đau răng",
    specialty: "Răng hàm mặt",
    commonSymptoms: ["Đau răng", "Sưng nướu", "Nhạy cảm với lạnh/nóng"],
    medications: [
      {
        name: "Paracetamol 500mg",
        dosage: "1 viên",
        frequency: "3 lần/ngày",
        duration: "3 ngày",
        instructions: "Uống khi đau",
        quantity: 9
      },
      {
        name: "Amoxicillin 500mg",
        dosage: "1 viên",
        frequency: "3 lần/ngày",
        duration: "7 ngày",
        instructions: "Uống sau ăn",
        quantity: 21
      }
    ],
    notes: "Hẹn tái khám sau 1 tuần, vệ sinh răng miệng kỹ"
  }
];

export const prescriptions = [
  {
    id: "pres_001",
    appointmentId: "apt_001",
    doctorId: "doc_001",
    doctorName: "BS. Nguyễn Văn A",
    patientId: "user_001",
    patientName: "Nguyễn Văn B",
    date: "2024-01-15",
    diagnosis: "Cảm cúm",
    medications: [
      {
        id: "med_001",
        name: "Paracetamol 500mg",
        genericName: "Paracetamol",
        dosage: "1 viên",
        frequency: "3 lần/ngày",
        duration: "5 ngày",
        quantity: 15,
        instructions: "Uống sau ăn",
        price: 50000
      },
      {
        id: "med_002",
        name: "Oresol",
        genericName: "Oral Rehydration Salts",
        dosage: "1 gói",
        frequency: "2 lần/ngày",
        duration: "3 ngày",
        quantity: 6,
        instructions: "Pha với 200ml nước",
        price: 30000
      }
    ],
    totalAmount: 80000,
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PRES_001",
    qrData: {
      prescriptionId: "pres_001",
      patientName: "Nguyễn Văn B",
      date: "2024-01-15",
      doctorName: "BS. Nguyễn Văn A",
      medications: [
        {
          name: "Paracetamol 500mg",
          quantity: 15,
          instructions: "Uống sau ăn, 3 lần/ngày"
        }
      ]
    },
    status: "active",
    pharmacyInstructions: "Có thể mua tại bất kỳ nhà thuốc nào. Xuất trình mã QR để được tư vấn.",
    followUpDate: "2024-01-22",
    notes: "Nghỉ ngơi, uống nhiều nước"
  },
  {
    id: "pres_002",
    appointmentId: "apt_002",
    doctorId: "doc_002",
    doctorName: "BS. Trần Thị B",
    patientId: "user_002",
    patientName: "Nguyễn Thị C",
    date: "2024-01-14",
    diagnosis: "Viêm dạ dày",
    medications: [
      {
        id: "med_003",
        name: "Omeprazole 20mg",
        genericName: "Omeprazole",
        dosage: "1 viên",
        frequency: "1 lần/ngày",
        duration: "14 ngày",
        quantity: 14,
        instructions: "Uống trước ăn sáng",
        price: 140000
      }
    ],
    totalAmount: 140000,
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PRES_002",
    status: "active",
    pharmacyInstructions: "Thuốc kê đơn, cần đơn của bác sĩ",
    followUpDate: "2024-01-28"
  }
];

export const medicationDatabase = [
  {
    id: "med_db_001",
    name: "Paracetamol 500mg",
    genericName: "Paracetamol",
    category: "Giảm đau, Hạ sốt",
    commonDosages: ["500mg", "650mg"],
    commonFrequencies: ["1 lần/ngày", "2 lần/ngày", "3 lần/ngày", "4 lần/ngày"],
    price: 50000,
    available: true,
    requiresPrescription: false
  },
  {
    id: "med_db_002",
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    category: "Thuốc dạ dày",
    commonDosages: ["20mg", "40mg"],
    commonFrequencies: ["1 lần/ngày", "2 lần/ngày"],
    price: 100000,
    available: true,
    requiresPrescription: true
  },
  {
    id: "med_db_003",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    category: "Kháng sinh",
    commonDosages: ["250mg", "500mg"],
    commonFrequencies: ["2 lần/ngày", "3 lần/ngày"],
    price: 80000,
    available: true,
    requiresPrescription: true
  },
  {
    id: "med_db_004",
    name: "Amlodipine 5mg",
    genericName: "Amlodipine",
    category: "Tim mạch",
    commonDosages: ["5mg", "10mg"],
    commonFrequencies: ["1 lần/ngày"],
    price: 120000,
    available: true,
    requiresPrescription: true
  }
];

