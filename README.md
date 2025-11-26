# 🏥 Doctor Booking System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen.svg)
![React](https://img.shields.io/badge/React-19.1.1-61dafb.svg)
![Java](https://img.shields.io/badge/Java-21-orange.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)

**Hệ thống đặt lịch khám bệnh hiện đại với giao diện đẹp mắt và trải nghiệm người dùng tối ưu**

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Sử Dụng](#-sử-dụng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Giới Thiệu

**Doctor Booking System** là một hệ thống quản lý đặt lịch khám bệnh toàn diện, được xây dựng với kiến trúc hiện đại và giao diện người dùng đẹp mắt. Hệ thống hỗ trợ ba vai trò chính: **Quản trị viên (Admin)**, **Bác sĩ (Doctor)**, và **Bệnh nhân (Patient)**, mỗi vai trò có các chức năng riêng biệt và được bảo mật chặt chẽ.

### ✨ Điểm Nổi Bật

- 🎨 **UI/UX Hiện Đại**: Thiết kế theo phong cách Linear.app với dark mode, ultra-minimalist
- 🔐 **Bảo Mật Cao**: JWT authentication, role-based access control (RBAC)
- 📱 **Responsive Design**: Tối ưu cho mọi thiết bị
- ⚡ **Performance**: React 19 + Vite, Spring Boot 3.5.6
- 🎭 **Smooth Animations**: Hiệu ứng chuyển trang mượt mà, vertical expansion form

---

## 🚀 Tính Năng

### 👨‍💼 Module Quản Trị Viên (Admin)

- ✅ **Quản lý Bác sĩ**: Thêm, sửa, xóa, xem chi tiết bác sĩ
- ✅ **Quản lý Bệnh nhân**: Tìm kiếm, xem chi tiết bệnh nhân và lịch sử điều trị
- ✅ **Quản lý Lịch hẹn**: Xem tất cả lịch hẹn, lọc theo ngày
- ✅ **Quản lý Phản hồi**: Xem và quản lý phản hồi từ bệnh nhân
- ✅ **Dashboard**: Thống kê tổng quan hệ thống

### 👨‍⚕️ Module Bác Sĩ (Doctor)

- ✅ **Quản lý Hồ sơ**: Cập nhật thông tin cá nhân, đổi mật khẩu
- ✅ **Lịch hẹn**: Xem lịch hẹn của mình, lọc theo ngày
- ✅ **Quản lý Điều trị**: Thêm, cập nhật phương pháp điều trị cho bệnh nhân
- ✅ **Tìm kiếm Bệnh nhân**: Tìm kiếm bệnh nhân theo tên hoặc ID
- ✅ **Xem Lịch sử Điều trị**: Xem toàn bộ lịch sử điều trị của bệnh nhân

### 👤 Module Bệnh Nhân (Patient)

- ✅ **Đăng ký & Đăng nhập**: Form đăng ký/đăng nhập với hiệu ứng vertical expansion
- ✅ **Quản lý Hồ sơ**: Cập nhật thông tin, đổi mật khẩu
- ✅ **Đặt Lịch**: Đặt lịch hẹn với bác sĩ, chọn ngày và khung giờ
- ✅ **Lịch sử Đặt chỗ**: Xem và hủy các lịch hẹn đã đặt
- ✅ **Tìm kiếm Bác sĩ**: Tìm kiếm bác sĩ theo tên, chuyên khoa
- ✅ **Xem Điều trị**: Xem các phương pháp điều trị được bác sĩ chỉ định
- ✅ **Gửi Phản hồi**: Gửi phản hồi cho quản trị viên

### 🌐 Trang Công Khai

- ✅ **Homepage**: Trang chủ với video background, hero section, features, stats
- ✅ **Danh sách Bác sĩ**: Xem danh sách bác sĩ, tìm kiếm và lọc
- ✅ **Chuyên khoa**: Xem các chuyên khoa y tế
- ✅ **Về chúng tôi**: Thông tin về hệ thống
- ✅ **Liên hệ**: Form liên hệ và thông tin liên lạc
- ✅ **Footer**: Footer đầy đủ với social links, newsletter signup

---

## 🛠️ Tech Stack

### Backend

- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **Database**: MySQL 8.0
- **Security**: Spring Security + JWT
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven
- **API**: RESTful API

### Frontend

- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.14
- **Routing**: React Router DOM 7.9.4
- **HTTP Client**: Axios 1.12.2
- **Icons**: 
  - Ionicons (via CDN)
  - Feather Icons (via CDN)
- **Styling**: CSS3 với animations, glassmorphism
- **State Management**: React Context API

### Database

- **RDBMS**: MySQL 8.0
- **Schema**: Xem `database/schema.sql`

---

## 📦 Cài Đặt

### Yêu Cầu Hệ Thống

- **Java**: JDK 21 hoặc cao hơn
- **Node.js**: v18.x hoặc cao hơn
- **npm**: v9.x hoặc cao hơn
- **MySQL**: 8.0 hoặc cao hơn
- **Maven**: 3.8.x hoặc cao hơn (hoặc sử dụng Maven Wrapper)

### Bước 1: Clone Repository

```bash
git clone https://github.com/your-username/Doctor-Booking-System.git
cd Doctor-Booking-System
```

### Bước 2: Cấu Hình Database

1. Tạo database MySQL:

```sql
CREATE DATABASE doctor_booking_system;
```

2. Chạy script schema:

```bash
mysql -u root -p doctor_booking_system < database/schema.sql
```

3. Tạo user admin (tùy chọn):

```bash
mysql -u root -p doctor_booking_system < database/create_admin.sql
```

### Bước 3: Cấu Hình Backend

1. Di chuyển vào thư mục backend:

```bash
cd backend
```

2. Tạo file `.env` hoặc set environment variables:

```bash
# Windows (PowerShell)
$env:DB_URL="jdbc:mysql://localhost:3306/doctor_booking_system?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="your-secret-key-min-256-bits"
$env:JWT_EXPIRATION="86400000"
$env:JWT_REFRESH_EXPIRATION="604800000"
```

```bash
# Linux/Mac
export DB_URL="jdbc:mysql://localhost:3306/doctor_booking_system?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8"
export DB_USERNAME="root"
export DB_PASSWORD="your_password"
export JWT_SECRET="your-secret-key-min-256-bits"
export JWT_EXPIRATION="86400000"
export JWT_REFRESH_EXPIRATION="604800000"
```

3. Build và chạy backend:

```bash
# Sử dụng Maven Wrapper
./mvnw clean install
./mvnw spring-boot:run

# Hoặc sử dụng Maven
mvn clean install
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:7070`

### Bước 4: Cấu Hình Frontend

1. Di chuyển vào thư mục frontend:

```bash
cd frontend
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file `.env` (tùy chọn):

```env
VITE_API_BASE_URL=http://localhost:7070/api
```

4. Chạy development server:

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### Bước 5: Build Production

**Backend:**

```bash
cd backend
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

---

## ⚙️ Cấu Hình

### Backend Configuration

File: `backend/src/main/resources/application.properties`

```properties
# Database
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}
jwt.refresh-expiration=${JWT_REFRESH_EXPIRATION}

# Server
server.port=7070
```

### Frontend Configuration

File: `frontend/src/config/api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7070/api';
```

### Environment Variables

Tạo file `.env` trong thư mục root hoặc set environment variables:

**Backend:**
- `DB_URL`: MySQL connection string
- `DB_USERNAME`: MySQL username
- `DB_PASSWORD`: MySQL password
- `JWT_SECRET`: Secret key cho JWT (tối thiểu 256 bits)
- `JWT_EXPIRATION`: Token expiration time (milliseconds)
- `JWT_REFRESH_EXPIRATION`: Refresh token expiration time (milliseconds)

**Frontend:**
- `VITE_API_BASE_URL`: Backend API base URL

---

## 📖 Sử Dụng

### Đăng Nhập

1. Truy cập `http://localhost:5173/login`
2. Nhập email/username và mật khẩu
3. Hệ thống sẽ tự động redirect đến dashboard theo role

### Đăng Ký (Bệnh nhân)

1. Truy cập `http://localhost:5173/register`
2. Điền đầy đủ thông tin: Họ tên, Username, Email, Số điện thoại, Mật khẩu
3. Click "Đăng ký" để tạo tài khoản

### Tài Khoản Mặc Định

Sau khi setup database, có thể tạo tài khoản admin bằng script:

```bash
mysql -u root -p doctor_booking_system < database/create_admin.sql
```

Hoặc tham khảo file `database/ADMINDAT_SETUP.md` để tạo thủ công.

---

## 📁 Cấu Trúc Dự Án

```
Doctor-Booking-System/
├── backend/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/doctorbooking/backend/
│   │   │   │   ├── config/     # Security, CORS, JWT config
│   │   │   │   ├── controller/ # REST Controllers
│   │   │   │   ├── dto/        # Data Transfer Objects
│   │   │   │   ├── exception/  # Exception handlers
│   │   │   │   ├── model/      # Entity models
│   │   │   │   ├── repository/ # JPA Repositories
│   │   │   │   ├── service/     # Business logic
│   │   │   │   └── util/       # Utilities (JWT, Password)
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/               # Unit tests
│   ├── pom.xml
│   └── mvnw                    # Maven Wrapper
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── assets/             # Images, videos
│   │   ├── components/         # React Components
│   │   │   ├── admin/          # Admin components
│   │   │   ├── common/         # Shared components
│   │   │   ├── doctor/         # Doctor components
│   │   │   └── patient/        # Patient components
│   │   ├── contexts/           # React Context (Auth)
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── auth/          # Auth pages
│   │   │   ├── doctor/        # Doctor pages
│   │   │   └── patient/       # Patient pages
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   ├── config/            # Configuration
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── database/                   # Database scripts
│   ├── schema.sql             # Database schema
│   ├── create_admin.sql       # Admin user setup
│   └── README.md              # Database docs
│
└── README.md                   # This file
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:7070/api
```

### Authentication Endpoints

#### Đăng Nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "refreshToken": "refresh-token",
  "id": 1,
  "username": "string",
  "email": "string",
  "role": "ADMIN|DOCTOR|PATIENT",
  "fullName": "string"
}
```

#### Đăng Ký
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string"
}
```

### Admin Endpoints

```http
# Quản lý Bác sĩ
GET    /api/admin/doctors
POST   /api/admin/doctors
GET    /api/admin/doctors/{id}
PUT    /api/admin/doctors/{id}
DELETE /api/admin/doctors/{id}

# Quản lý Bệnh nhân
GET    /api/admin/patients
GET    /api/admin/patients/{id}

# Quản lý Lịch hẹn
GET    /api/admin/appointments?date=YYYY-MM-DD

# Quản lý Phản hồi
GET    /api/admin/feedbacks
```

### Doctor Endpoints

```http
# Hồ sơ
GET    /api/doctor/profile
PUT    /api/doctor/profile
POST   /api/doctor/change-password

# Lịch hẹn
GET    /api/doctor/appointments?date=YYYY-MM-DD
GET    /api/doctor/appointments/{id}

# Điều trị
GET    /api/doctor/treatments
POST   /api/doctor/treatments
PUT    /api/doctor/treatments/{id}

# Bệnh nhân
GET    /api/doctor/patients?search=keyword
GET    /api/doctor/patients/{id}
GET    /api/doctor/patients/{id}/treatments
```

### Patient Endpoints

```http
# Hồ sơ
GET    /api/patient/profile
PUT    /api/patient/profile
POST   /api/patient/change-password

# Đặt lịch
POST   /api/patient/appointments
GET    /api/patient/appointments
GET    /api/patient/appointments/{id}
DELETE /api/patient/appointments/{id}

# Bác sĩ
GET    /api/patient/doctors?search=keyword&specialization=string
GET    /api/patient/doctors/{id}

# Phản hồi
POST   /api/patient/feedbacks

# Điều trị
GET    /api/patient/treatments
GET    /api/patient/treatments/{id}
```

**Lưu ý**: Tất cả các endpoints (trừ `/api/auth/**`) đều yêu cầu JWT token trong header:

```http
Authorization: Bearer <token>
```

---

## 🔧 Development

### Backend Development

```bash
cd backend

# Chạy với hot reload (nếu có Spring DevTools)
./mvnw spring-boot:run

# Chạy tests
./mvnw test

# Build JAR
./mvnw clean package
```

### Frontend Development

```bash
cd frontend

# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Style

- **Backend**: Tuân thủ Java coding conventions
- **Frontend**: ESLint configuration (xem `frontend/eslint.config.js`)

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
./mvnw test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 📝 Database Scripts

Các script database nằm trong thư mục `database/`:

- `schema.sql`: Schema chính của database
- `create_admin.sql`: Tạo tài khoản admin mặc định
- `create_doctor.sql`: Tạo tài khoản bác sĩ mẫu
- `check_*.sql`: Scripts kiểm tra dữ liệu

Xem thêm: `database/README.md`

---

## 🐛 Troubleshooting

### Backend không kết nối được database

1. Kiểm tra MySQL đã chạy chưa
2. Kiểm tra connection string trong environment variables
3. Kiểm tra username/password có đúng không
4. Kiểm tra database đã được tạo chưa

### Frontend không kết nối được API

1. Kiểm tra backend đã chạy chưa (`http://localhost:7070`)
2. Kiểm tra `VITE_API_BASE_URL` trong `.env`
3. Kiểm tra CORS configuration trong backend

### JWT Token expired

Token sẽ tự động refresh hoặc user cần đăng nhập lại.

---

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Coding Standards

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation if needed

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [Linear.app](https://linear.app) - Design inspiration
- [Feather Icons](https://feathericons.com) - Icon library
- [Ionicons](https://ionic.io/ionicons) - Icon library
- Spring Boot team
- React team

---

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:

- 📧 Email: support@doctorbooking.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/Doctor-Booking-System/issues)
- 📖 Documentation: Xem thêm trong các file README trong từng module

---

<div align="center">

**Made with ❤️ by Doctor Booking Team**

⭐ Star this repo nếu bạn thấy hữu ích!

</div>
