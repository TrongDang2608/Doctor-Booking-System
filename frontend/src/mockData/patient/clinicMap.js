// Clinic Map / Indoor Navigation - Mock Data

export const clinics = [
  {
    id: "clinic_001",
    name: "Bệnh viện Đa khoa ABC",
    address: "123 Đường XYZ, Quận 1, TP.HCM",
    floors: [
      {
        floorNumber: 1,
        name: "Tầng 1 - Tiếp đón",
        rooms: [
          {
            id: "room_101",
            number: "101",
            name: "Phòng Tiếp đón",
            type: "reception",
            coordinates: { x: 100, y: 200 }
          },
          {
            id: "room_102",
            number: "102",
            name: "Phòng Cấp cứu",
            type: "emergency",
            coordinates: { x: 300, y: 200 }
          },
          {
            id: "room_103",
            number: "103",
            name: "Quầy Thanh toán",
            type: "payment",
            coordinates: { x: 200, y: 150 }
          }
        ],
        facilities: [
          {
            id: "fac_001",
            type: "parking",
            name: "Bãi đỗ xe",
            coordinates: { x: 50, y: 50 }
          },
          {
            id: "fac_002",
            type: "elevator",
            name: "Thang máy A",
            coordinates: { x: 200, y: 150 }
          },
          {
            id: "fac_003",
            type: "restroom",
            name: "Nhà vệ sinh",
            coordinates: { x: 350, y: 100 }
          }
        ]
      },
      {
        floorNumber: 2,
        name: "Tầng 2 - Khám bệnh",
        rooms: [
          {
            id: "room_201",
            number: "201",
            name: "Phòng BS. Nguyễn Văn A",
            type: "consultation",
            doctorId: "doc_001",
            specialty: "Tim mạch",
            coordinates: { x: 150, y: 250 }
          },
          {
            id: "room_202",
            number: "202",
            name: "Phòng BS. Trần Thị B",
            type: "consultation",
            doctorId: "doc_002",
            specialty: "Nhi khoa",
            coordinates: { x: 300, y: 250 }
          },
          {
            id: "room_203",
            number: "203",
            name: "Phòng Xét nghiệm",
            type: "lab",
            coordinates: { x: 450, y: 200 }
          }
        ],
        facilities: [
          {
            id: "fac_004",
            type: "elevator",
            name: "Thang máy A",
            coordinates: { x: 200, y: 150 }
          },
          {
            id: "fac_005",
            type: "waiting_area",
            name: "Khu chờ",
            coordinates: { x: 100, y: 100 }
          }
        ]
      },
      {
        floorNumber: 3,
        name: "Tầng 3 - Chẩn đoán hình ảnh",
        rooms: [
          {
            id: "room_301",
            number: "301",
            name: "Phòng X-quang",
            type: "imaging",
            coordinates: { x: 200, y: 200 }
          },
          {
            id: "room_302",
            number: "302",
            name: "Phòng Siêu âm",
            type: "imaging",
            coordinates: { x: 350, y: 200 }
          }
        ]
      }
    ],
    navigationRoutes: [
      {
        from: "parking_001",
        to: "room_201",
        steps: [
          { instruction: "Đi thẳng 50m từ bãi đỗ xe", distance: 50, floor: 1 },
          { instruction: "Lên thang máy A đến tầng 2", floor: 2 },
          { instruction: "Rẽ trái, đi 20m", distance: 20, floor: 2 },
          { instruction: "Phòng 201 ở bên phải", floor: 2 }
        ],
        estimatedTime: 3, // minutes
        estimatedDistance: 70 // meters
      },
      {
        from: "room_101",
        to: "room_203",
        steps: [
          { instruction: "Lên thang máy A đến tầng 2", floor: 2 },
          { instruction: "Đi thẳng 250m", distance: 250, floor: 2 },
          { instruction: "Phòng Xét nghiệm ở cuối hành lang", floor: 2 }
        ],
        estimatedTime: 5,
        estimatedDistance: 250
      }
    ]
  }
];

export const appointmentNavigation = [
  {
    appointmentId: "apt_001",
    clinicId: "clinic_001",
    roomId: "room_201",
    roomNumber: "201",
    floor: 2,
    fromLocation: "parking",
    route: {
      steps: [
        { instruction: "Từ bãi đỗ xe, đi vào cửa chính", floor: 1 },
        { instruction: "Lên thang máy A đến tầng 2", floor: 2 },
        { instruction: "Rẽ trái, đi 20m đến phòng 201", floor: 2 }
      ],
      estimatedTime: 3
    }
  }
];


