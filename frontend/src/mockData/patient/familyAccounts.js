// Family Account Management - Mock Data

export const familyAccountData = {
  mainAccount: {
    userId: "user_001",
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0909123456",
    role: "parent",
    relationship: "self"
  },
  familyMembers: [
    {
      id: "member_001",
      userId: "user_001",
      fullName: "Nguyễn Văn A",
      dateOfBirth: "1985-05-15",
      gender: "male",
      relationship: "self",
      isMainAccount: true,
      avatar: null,
      medicalHistory: [
        {
          appointmentId: "apt_001",
          date: "2024-01-10",
          doctor: "BS. Trần Văn C",
          specialty: "Tim mạch",
          diagnosis: "Tăng huyết áp",
          prescription: "pres_001"
        }
      ]
    },
    {
      id: "member_002",
      fullName: "Nguyễn Thị B",
      dateOfBirth: "2015-03-20",
      gender: "female",
      relationship: "child",
      isMainAccount: false,
      avatar: null,
      medicalHistory: [
        {
          appointmentId: "apt_002",
          date: "2024-01-12",
          doctor: "BS. Lê Thị D",
          specialty: "Nhi khoa",
          diagnosis: "Cảm cúm",
          prescription: "pres_002"
        }
      ],
      allergies: ["Penicillin"],
      chronicConditions: []
    },
    {
      id: "member_003",
      fullName: "Nguyễn Văn D",
      dateOfBirth: "1950-08-10",
      gender: "male",
      relationship: "parent",
      isMainAccount: false,
      avatar: null,
      medicalHistory: [
        {
          appointmentId: "apt_003",
          date: "2024-01-08",
          doctor: "BS. Phạm Văn E",
          specialty: "Nội tổng quát",
          diagnosis: "Tiểu đường type 2",
          prescription: "pres_003"
        }
      ],
      allergies: [],
      chronicConditions: ["Tiểu đường", "Tăng huyết áp"]
    },
    {
      id: "member_004",
      fullName: "Nguyễn Thị E",
      dateOfBirth: "1987-11-25",
      gender: "female",
      relationship: "spouse",
      isMainAccount: false,
      avatar: null,
      medicalHistory: [],
      allergies: [],
      chronicConditions: []
    }
  ],
  permissions: {
    canBookAppointment: true,
    canViewMedicalHistory: true,
    canManageProfile: true,
    canViewPrescriptions: true,
    canMakePayments: true
  }
};

export const relationshipTypes = [
  { value: "self", label: "Bản thân", icon: "👤" },
  { value: "spouse", label: "Vợ/Chồng", icon: "💑" },
  { value: "child", label: "Con", icon: "👶" },
  { value: "parent", label: "Bố/Mẹ", icon: "👴👵" },
  { value: "sibling", label: "Anh/Chị/Em", icon: "👫" },
  { value: "other", label: "Khác", icon: "👥" }
];

export const familyMemberTemplates = [
  {
    id: "template_001",
    name: "Trẻ em (0-12 tuổi)",
    defaultSpecialty: "Nhi khoa",
    requiredFields: ["dateOfBirth", "gender", "allergies"],
    suggestedVaccinations: ["BCG", "Hepatitis B", "DPT", "Polio", "MMR"]
  },
  {
    id: "template_002",
    name: "Người cao tuổi (60+)",
    defaultSpecialty: "Nội tổng quát",
    requiredFields: ["dateOfBirth", "gender", "chronicConditions", "currentMedications"],
    suggestedCheckups: ["Khám tổng quát", "Xét nghiệm máu", "Đo huyết áp", "Đo đường huyết"]
  },
  {
    id: "template_003",
    name: "Phụ nữ mang thai",
    defaultSpecialty: "Sản phụ khoa",
    requiredFields: ["dateOfBirth", "gender", "pregnancyWeek", "previousPregnancies"],
    suggestedCheckups: ["Siêu âm", "Xét nghiệm máu", "Theo dõi thai kỳ"]
  }
];

