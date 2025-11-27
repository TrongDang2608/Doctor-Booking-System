// Health Wallet & Loyalty System - Mock Data

export const walletData = {
  userId: "user_001",
  balance: 500000, // VNĐ
  points: 2500,
  transactions: [
    {
      id: "txn_001",
      type: "payment",
      amount: 300000,
      pointsEarned: 150,
      description: "Thanh toán khám bệnh - BS. Nguyễn Văn A",
      date: "2024-01-15T09:00:00Z",
      status: "completed"
    },
    {
      id: "txn_002",
      type: "payment",
      amount: 500000,
      pointsEarned: 250,
      description: "Thanh toán gói khám tổng quát",
      date: "2024-01-10T08:00:00Z",
      status: "completed"
    },
    {
      id: "txn_003",
      type: "reward",
      amount: -20000,
      pointsSpent: 100,
      description: "Đổi điểm thành tiền mặt",
      date: "2024-01-08T10:00:00Z",
      status: "completed"
    },
    {
      id: "txn_004",
      type: "refund",
      amount: 150000,
      description: "Hoàn tiền - Hủy lịch hẹn",
      date: "2024-01-05T14:00:00Z",
      status: "completed"
    }
  ],
  paymentMethods: [
    {
      id: "pm_001",
      type: "vnpay",
      name: "VNPay",
      last4: "1234",
      isDefault: true
    },
    {
      id: "pm_002",
      type: "momo",
      name: "MoMo",
      phone: "0909123456",
      isDefault: false
    },
    {
      id: "pm_003",
      type: "bank",
      name: "Ngân hàng ABC",
      last4: "5678",
      isDefault: false
    }
  ]
};

export const vouchers = [
  {
    id: "voucher_001",
    code: "HEALTH50",
    title: "Giảm 50% khám tổng quát",
    description: "Áp dụng cho gói khám sức khỏe tổng quát",
    discountType: "percentage",
    discountValue: 50,
    minPurchase: 500000,
    pointsRequired: 1000,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    isRedeemed: false,
    category: "health_checkup"
  },
  {
    id: "voucher_002",
    code: "POINTS100",
    title: "Đổi 100 điểm = 20.000 VNĐ",
    description: "Quy đổi điểm thưởng thành tiền mặt",
    pointsRequired: 100,
    cashValue: 20000,
    isRedeemed: false,
    category: "points_exchange"
  },
  {
    id: "voucher_003",
    code: "FIRST50",
    title: "Giảm 50.000 VNĐ cho lần khám đầu",
    description: "Dành cho khách hàng mới",
    discountType: "fixed",
    discountValue: 50000,
    minPurchase: 200000,
    pointsRequired: 0,
    validFrom: "2024-01-01",
    validTo: "2024-06-30",
    isRedeemed: false,
    category: "new_customer"
  },
  {
    id: "voucher_004",
    code: "BIRTHDAY20",
    title: "Giảm 20% nhân dịp sinh nhật",
    description: "Voucher sinh nhật đặc biệt",
    discountType: "percentage",
    discountValue: 20,
    minPurchase: 300000,
    pointsRequired: 500,
    validFrom: "2024-01-15",
    validTo: "2024-02-15",
    isRedeemed: true,
    category: "birthday"
  }
];

export const loyaltyTiers = [
  {
    tier: "bronze",
    name: "Đồng",
    minPoints: 0,
    maxPoints: 999,
    benefits: [
      "Tích điểm 1% mỗi giao dịch",
      "Ưu đãi đặc biệt vào sinh nhật"
    ],
    icon: "🥉"
  },
  {
    tier: "silver",
    name: "Bạc",
    minPoints: 1000,
    maxPoints: 4999,
    benefits: [
      "Tích điểm 2% mỗi giao dịch",
      "Giảm 5% phí khám",
      "Ưu tiên đặt lịch",
      "Tư vấn miễn phí qua chat"
    ],
    icon: "🥈"
  },
  {
    tier: "gold",
    name: "Vàng",
    minPoints: 5000,
    maxPoints: 9999,
    benefits: [
      "Tích điểm 3% mỗi giao dịch",
      "Giảm 10% phí khám",
      "Ưu tiên đặt lịch cao nhất",
      "Tư vấn miễn phí 24/7",
      "Khám tổng quát miễn phí 1 lần/năm"
    ],
    icon: "🥇"
  },
  {
    tier: "platinum",
    name: "Bạch kim",
    minPoints: 10000,
    maxPoints: Infinity,
    benefits: [
      "Tích điểm 5% mỗi giao dịch",
      "Giảm 15% phí khám",
      "Ưu tiên tuyệt đối",
      "Tư vấn miễn phí 24/7 với bác sĩ chuyên khoa",
      "Khám tổng quát miễn phí 2 lần/năm",
      "Được mời tham gia các sự kiện y tế độc quyền"
    ],
    icon: "💎"
  }
];

export const pointHistory = [
  {
    id: "ph_001",
    points: 150,
    type: "earned",
    description: "Tích điểm từ thanh toán khám bệnh",
    date: "2024-01-15T09:00:00Z"
  },
  {
    id: "ph_002",
    points: 250,
    type: "earned",
    description: "Tích điểm từ gói khám tổng quát",
    date: "2024-01-10T08:00:00Z"
  },
  {
    id: "ph_003",
    points: -100,
    type: "spent",
    description: "Đổi điểm thành tiền mặt",
    date: "2024-01-08T10:00:00Z"
  },
  {
    id: "ph_004",
    points: -500,
    type: "spent",
    description: "Đổi voucher giảm giá",
    date: "2024-01-05T14:00:00Z"
  }
];


