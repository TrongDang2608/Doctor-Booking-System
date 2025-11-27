// Inventory Management - Mock Data

export const medications = [
  {
    id: "med_inv_001",
    name: "Paracetamol 500mg",
    genericName: "Paracetamol",
    category: "Giảm đau, Hạ sốt",
    manufacturer: "Công ty Dược phẩm ABC",
    batchNumber: "BATCH001",
    quantity: 500,
    unit: "viên",
    unitPrice: 5000,
    totalValue: 2500000,
    expiryDate: "2025-12-31",
    minStockLevel: 100,
    maxStockLevel: 1000,
    reorderLevel: 150,
    status: "in_stock", // in_stock | low_stock | out_of_stock | expired
    location: "Kho A - Kệ 3",
    lastRestocked: "2024-01-10",
    lastRestockedQuantity: 1000,
    supplierId: "supplier_001"
  },
  {
    id: "med_inv_002",
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    category: "Thuốc dạ dày",
    manufacturer: "Công ty Dược phẩm XYZ",
    batchNumber: "BATCH002",
    quantity: 45,
    unit: "viên",
    unitPrice: 10000,
    totalValue: 450000,
    expiryDate: "2024-06-30",
    minStockLevel: 50,
    maxStockLevel: 500,
    reorderLevel: 75,
    status: "low_stock",
    location: "Kho A - Kệ 5",
    lastRestocked: "2024-01-05",
    lastRestockedQuantity: 200,
    supplierId: "supplier_002",
    alertSent: true
  },
  {
    id: "med_inv_003",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    category: "Kháng sinh",
    manufacturer: "Công ty Dược phẩm DEF",
    batchNumber: "BATCH003",
    quantity: 0,
    unit: "viên",
    unitPrice: 8000,
    totalValue: 0,
    expiryDate: "2025-03-31",
    minStockLevel: 100,
    maxStockLevel: 800,
    reorderLevel: 150,
    status: "out_of_stock",
    location: "Kho B - Kệ 2",
    lastRestocked: "2023-12-20",
    lastRestockedQuantity: 500,
    supplierId: "supplier_001",
    alertSent: true
  },
  {
    id: "med_inv_004",
    name: "Amlodipine 5mg",
    genericName: "Amlodipine",
    category: "Tim mạch",
    manufacturer: "Công ty Dược phẩm GHI",
    batchNumber: "BATCH004",
    quantity: 200,
    unit: "viên",
    unitPrice: 12000,
    totalValue: 2400000,
    expiryDate: "2024-02-15",
    minStockLevel: 50,
    maxStockLevel: 300,
    reorderLevel: 75,
    status: "in_stock",
    location: "Kho B - Kệ 4",
    lastRestocked: "2024-01-01",
    lastRestockedQuantity: 300,
    supplierId: "supplier_003",
    expiringSoon: true // Expires in 30 days
  }
];

export const stockMovements = [
  {
    id: "movement_001",
    medicationId: "med_inv_001",
    medicationName: "Paracetamol 500mg",
    type: "in", // in | out | adjustment | return
    quantity: 1000,
    reason: "Nhập kho",
    date: "2024-01-10",
    performedBy: "admin_001",
    supplierId: "supplier_001",
    invoiceNumber: "INV-2024-001"
  },
  {
    id: "movement_002",
    medicationId: "med_inv_001",
    medicationName: "Paracetamol 500mg",
    type: "out",
    quantity: 15,
    reason: "Kê đơn cho bệnh nhân",
    prescriptionId: "pres_001",
    date: "2024-01-15",
    performedBy: "doc_001"
  },
  {
    id: "movement_003",
    medicationId: "med_inv_002",
    medicationName: "Omeprazole 20mg",
    type: "adjustment",
    quantity: -5,
    reason: "Điều chỉnh do hư hỏng",
    date: "2024-01-12",
    performedBy: "admin_001"
  },
  {
    id: "movement_004",
    medicationId: "med_inv_003",
    medicationName: "Amoxicillin 500mg",
    type: "out",
    quantity: 500,
    reason: "Kê đơn cho bệnh nhân",
    date: "2024-01-14",
    performedBy: "doc_002"
  }
];

export const alerts = [
  {
    id: "alert_001",
    medicationId: "med_inv_002",
    medicationName: "Omeprazole 20mg",
    type: "low_stock",
    message: "Omeprazole 20mg sắp hết (còn 45 viên, mức tối thiểu: 50)",
    severity: "warning", // info | warning | critical
    createdAt: "2024-01-15T08:00:00Z",
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null
  },
  {
    id: "alert_002",
    medicationId: "med_inv_003",
    medicationName: "Amoxicillin 500mg",
    type: "out_of_stock",
    message: "Amoxicillin 500mg đã hết hàng",
    severity: "critical",
    createdAt: "2024-01-14T10:00:00Z",
    acknowledged: true,
    acknowledgedBy: "admin_001",
    acknowledgedAt: "2024-01-14T11:00:00Z"
  },
  {
    id: "alert_003",
    medicationId: "med_inv_004",
    medicationName: "Amlodipine 5mg",
    type: "expiring_soon",
    message: "Amlodipine 5mg sẽ hết hạn trong 30 ngày (Hạn: 2024-02-15)",
    severity: "warning",
    createdAt: "2024-01-15T09:00:00Z",
    acknowledged: false
  }
];

export const suppliers = [
  {
    id: "supplier_001",
    name: "Công ty Dược phẩm ABC",
    contact: "0909123456",
    email: "contact@abcpharma.com",
    address: "123 Đường XYZ, Quận 1, TP.HCM",
    medications: ["med_inv_001", "med_inv_003"],
    paymentTerms: "Net 30",
    rating: 4.8,
    lastOrderDate: "2024-01-10"
  },
  {
    id: "supplier_002",
    name: "Công ty Dược phẩm XYZ",
    contact: "0909765432",
    email: "sales@xyzpharma.com",
    address: "456 Đường ABC, Quận 2, TP.HCM",
    medications: ["med_inv_002"],
    paymentTerms: "Net 15",
    rating: 4.6,
    lastOrderDate: "2024-01-05"
  },
  {
    id: "supplier_003",
    name: "Công ty Dược phẩm GHI",
    contact: "0909555666",
    email: "info@ghipharma.com",
    address: "789 Đường DEF, Quận 3, TP.HCM",
    medications: ["med_inv_004"],
    paymentTerms: "Net 30",
    rating: 4.9,
    lastOrderDate: "2024-01-01"
  }
];

export const inventoryStats = {
  totalMedications: 150,
  totalValue: 125000000, // VNĐ
  lowStockItems: 12,
  outOfStockItems: 3,
  expiringSoonItems: 8,
  totalMovementsThisMonth: 450
};


