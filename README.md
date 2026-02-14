adad ádad
# 🏥 Doctor Booking System

Hệ thống đặt lịch khám bệnh trực tuyến hiện đại với đầy đủ tính năng cho Bệnh nhân, Bác sĩ và Quản trị viên.

## ✨ Tính năng nổi bậtt

### 🎨 **UI/UX Hiện đại**
- **Animated Logout Button** ☀️🌙
  - Hiệu ứng người đi vào cửa và rơi xuống
  - Áp dụng cho tất cả layouts (Patient, Doctor, Admin, Homepage)
  - Multiple variants: dark, light, transparent, danger

- **Animated Login Form**
  - Background video với hiệu ứng đổi màu rainbow
  - Floating labels (label bay lên khi focus)
  - Glass morphism effect
  - Smooth transitions giữa Login ↔ Register
  - Password toggle với icon con mắt

- **Space Parallax Scrolling** 🌌
  - Hiệu ứng parallax depth 3D trên homepage
  - Elements di chuyển với tốc độ khác nhau
  - Fade out effect khi scroll
  - Tạo cảm giác không gian sâu

### 👥 **Cho Bệnh Nhân**
- ✅ Đăng ký và quản lý tài khoản
- ✅ Tìm kiếm bác sĩ theo chuyên khoa
- ✅ Đặt lịch hẹn trực tuyến
- ✅ Xem lịch sử đặt lịch
- ✅ Hủy/đổi lịch hẹn
- ✅ Xem hồ sơ điều trị
- ✅ Gửi phản hồi đánh giá
- ✅ Ví sức khỏe (Health Wallet)
- ✅ Trợ lý AI - HealthAI Chat

### 👨‍⚕️ **Cho Bác Sĩ**
- ✅ Dashboard với thống kê
- ✅ Quản lý lịch hẹn
- ✅ Xác nhận/từ chối lịch hẹn
- ✅ Tạo và quản lý đơn thuốc điện tử
- ✅ Xem hồ sơ bệnh nhân
- ✅ Tìm kiếm bệnh nhân
- ✅ Quản lý điều trị

### 👨‍💼 **Cho Quản Trị Viên**
- ✅ Dashboard tổng quan
- ✅ Quản lý người dùng (Users)
- ✅ Quản lý bác sĩ
- ✅ Quản lý bệnh nhân
- ✅ Quản lý lịch hẹn
- ✅ Xem và xử lý phản hồi
- ✅ Thống kê và báo cáo

## 🛠️ Công nghệ sử dụng

### Backend
- **Java 21** với Spring Boot 3.5.6
- **Spring Security** - JWT Authentication
- **Spring Data JPA** - ORM
- **MySQL** - Database
- **Lombok** - Giảm boilerplate code
- **Validation API** - Validate dữ liệu

### Frontend
- **React 18** với Vite
- **React Router** - Navigation
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Feather Icons** - Icon set
- **Axios** - HTTP client

### Database
- **MySQL 8.0.35**
- **Aiven Cloud** - Database hosting

## 📦 Cài đặt

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/Doctor-Booking-System.git
cd Doctor-Booking-System
```

### 2. Backend Setup

#### Cài đặt Dependencies
```bash
cd backend
./mvnw install
```

#### Cấu hình Environment Variables
Tạo file `.env` trong thư mục `backend/`:

```env
# Database Configuration
DB_URL=jdbc:mysql://your-database-host:port/database_name?ssl-mode=REQUIRED
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Groq AI (Optional - for AI features)
GROQ_API_KEY=your_groq_api_key

# VNPAY (Optional - for payment features)
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:7070/api/vnpay/callback
```

Chi tiết xem file `backend/ENV_SETUP.md`

#### Chạy Backend
```bash
./mvnw spring-boot:run
```

Server sẽ chạy tại: http://localhost:7070

### 3. Frontend Setup

#### Cài đặt Dependencies
```bash
cd frontend
npm install
```

#### Cấu hình API Endpoint
File `frontend/src/config/api.js` đã được cấu hình sẵn:
```javascript
const API_BASE_URL = 'http://localhost:7070/api';
```

#### Chạy Frontend
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:5173

## 🎨 UI Components Đặc biệt

### 1. **Animated Logout Button** 
Component đẹp mắt với animation người đi vào cửa và rơi xuống
- Variants: dark, light, transparent, danger
- Location: `frontend/src/components/common/AnimatedLogoutButton.jsx`

### 2. **Floating Label Inputs**
Input fields với label bay lên khi focus
- Location: `frontend/src/pages/AuthUnified.jsx`

### 3. **Glass Morphism Cards**
Card trong suốt với backdrop blur
- Áp dụng trên toàn bộ ứng dụng

### 4. **Parallax Effects**
Hiệu ứng depth 3D khi scroll
- Homepage với space parallax

## 📁 Cấu trúc thư mục

```
Doctor-Booking-System/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/doctorbooking/backend/
│   │       │   ├── controller/     # REST Controllers
│   │       │   ├── service/        # Business Logic
│   │       │   ├── repository/     # Data Access
│   │       │   ├── model/          # Entities
│   │       │   ├── dto/            # Data Transfer Objects
│   │       │   ├── config/         # Configuration
│   │       │   └── exception/      # Exception Handling
│   │       └── resources/
│   │           └── application.properties
│   ├── pom.xml
│   └── ENV_SETUP.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Shared components
│   │   │   ├── patient/           # Patient components
│   │   │   ├── doctor/            # Doctor components
│   │   │   └── admin/             # Admin components
│   │   ├── pages/
│   │   │   ├── patient/           # Patient pages
│   │   │   ├── doctor/            # Doctor pages
│   │   │   └── admin/             # Admin pages
│   │   ├── services/              # API services
│   │   ├── contexts/              # React contexts
│   │   ├── utils/                 # Utilities
│   │   └── assets/                # Images, videos
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── migration_add_all_features.sql
│   ├── fix_database_name.sql
│   └── README.md
│
└── README.md
```

## 🔐 Authentication

### Roles & Permissions
- **PATIENT** - Đặt lịch, xem hồ sơ, phản hồi
- **DOCTOR** - Quản lý lịch hẹn, tạo đơn thuốc, xem bệnh nhân
- **ADMIN** - Quản lý toàn bộ hệ thống

### JWT Token
- Access Token: 24 giờ
- Refresh Token: 7 ngày
- Lưu trong localStorage

## 🎯 API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

### Patient
```
GET    /api/patient/appointments
POST   /api/patient/appointments
DELETE /api/patient/appointments/{id}
GET    /api/patient/treatments
POST   /api/patient/feedback
```

### Doctor
```
GET   /api/doctor/appointments
PUT   /api/doctor/appointments/{id}/confirm
PUT   /api/doctor/appointments/{id}/reject
POST  /api/doctor/treatments
GET   /api/doctor/patients/search
```

### Admin
```
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
GET    /api/admin/statistics
```

## 🌐 Demo Accounts

### Patient
```
Username: patient1
Password: password123
```

### Doctor
```
Username: doctor1
Password: password123
```

### Admin
```
Username: admin
Password: admin123
```

## 🎨 Thiết kế

### Color Palette
- Primary Purple: `#8b5cf6`
- Secondary Purple: `#6366f1`
- Success Green: `#10b981`
- Warning Yellow: `#f59e0b`
- Danger Red: `#ef4444`
- Dark Background: `#0f172a`

### Typography
- Primary: `'Inter', sans-serif`
- Secondary: `'Poppins', sans-serif`
- Monospace: `'Montserrat', sans-serif`

### Effects
- Backdrop Blur: 10-20px
- Border Radius: 8-15px
- Transitions: 0.3s ease
- Shadows: Multi-layer với purple tint

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px+)
- ✅ Tablet (768px+)
- ✅ Mobile (375px+)

## 🚀 Deployment

### Backend
```bash
cd backend
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

## 🐛 Troubleshooting

### Backend không start được
- Kiểm tra MySQL đã chạy chưa
- Verify environment variables trong `.env`
- Check logs trong console

### Frontend không connect được Backend
- Verify API_BASE_URL trong `frontend/src/config/api.js`
- Check CORS settings trong backend
- Kiểm tra network tab trong DevTools

### Lỗi duplicate ID
- Đã fix tất cả duplicate IDs
- Mỗi input có unique ID với prefix (login-, register-, etc.)

## 📝 Changelog

### Latest Updates (Dec 2024)
- ✅ Áp dụng Animated Logout Button
- ✅ Animated Login Form với floating labels
- ✅ Glass morphism UI throughout
- ✅ Parallax scrolling effects
- ✅ Việt hóa toàn bộ interface
- ✅ Fixed duplicate ID warnings
- ✅ Improved button centering
- ✅ Enhanced password input with toggle
- ✅ Background animations

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Huỳnh Phong Đạt**
- University: ut.edu.vn
- Project: Doctor Booking System
- Year: 2024

## 🙏 Credits

### Design Inspirations
- Animated Logout Button: @coding.stella
- Password Input Light: @coding.stella
- Animated Login Form: @coding.stella
- Newton Loader: CSS Animation
- Space Parallax: Parallax Scrolling Effect
- Hoverable Sidebar: Navigation Design

### Libraries & Tools
- Spring Boot
- React + Vite
- Tailwind CSS
- Framer Motion
- Feather Icons
- MySQL
- JWT
- Axios

## 📞 Support

For support, email: your-email@ut.edu.vn

## 🌟 Show your support

Give a ⭐️ if this project helped you!

---

Made with ❤️ in Vietnam 🇻🇳
