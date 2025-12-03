// Vietnamese Translations for Doctor Booking System

export const translations = {
  // Common Actions
  'Save': 'Lưu',
  'Cancel': 'Hủy',
  'Delete': 'Xóa',
  'Edit': 'Sửa',
  'View': 'Xem',
  'Submit': 'Gửi',
  'Confirm': 'Xác nhận',
  'Close': 'Đóng',
  'Back': 'Quay lại',
  'Next': 'Tiếp theo',
  'Previous': 'Trước',
  'Search': 'Tìm kiếm',
  'Filter': 'Lọc',
  'Sort': 'Sắp xếp',
  'Download': 'Tải xuống',
  'Upload': 'Tải lên',
  'Print': 'In',
  'Export': 'Xuất',
  'Import': 'Nhập',
  'Refresh': 'Làm mới',
  'Loading': 'Đang tải',
  'Loading...': 'Đang tải...',
  
  // Navigation
  'Dashboard': 'Bảng điều khiển',
  'Profile': 'Hồ sơ',
  'Settings': 'Cài đặt',
  'Logout': 'Đăng xuất',
  'Login': 'Đăng nhập',
  'Register': 'Đăng ký',
  'Sign In': 'Đăng nhập',
  'Sign Up': 'Đăng ký',
  
  // User Roles
  'Patient': 'Bệnh nhân',
  'Doctor': 'Bác sĩ',
  'Admin': 'Quản trị viên',
  'Administrator': 'Quản trị viên',
  
  // Appointments
  'Appointment': 'Lịch hẹn',
  'Appointments': 'Lịch hẹn',
  'Book Appointment': 'Đặt lịch hẹn',
  'New Booking': 'Đặt lịch mới',
  'Booking History': 'Lịch sử đặt lịch',
  'Upcoming Appointments': 'Lịch hẹn sắp tới',
  'Past Appointments': 'Lịch hẹn đã qua',
  'Recent Appointments': 'Lịch hẹn gần đây',
  'Appointment Date': 'Ngày hẹn',
  'Appointment Time': 'Giờ hẹn',
  'Appointment Details': 'Chi tiết lịch hẹn',
  'Cancel Appointment': 'Hủy lịch hẹn',
  'Reschedule': 'Đổi lịch',
  
  // Status
  'Status': 'Trạng thái',
  'Pending': 'Đang chờ',
  'Confirmed': 'Đã xác nhận',
  'Completed': 'Hoàn thành',
  'Cancelled': 'Đã hủy',
  'Active': 'Đang hoạt động',
  'Inactive': 'Không hoạt động',
  
  // Medical
  'Treatment': 'Điều trị',
  'Treatments': 'Điều trị',
  'My Treatments': 'Điều trị của tôi',
  'Treatment History': 'Lịch sử điều trị',
  'Diagnosis': 'Chẩn đoán',
  'Prescription': 'Đơn thuốc',
  'Medicine': 'Thuốc',
  'Medicines': 'Thuốc',
  'Symptoms': 'Triệu chứng',
  'Medical History': 'Lịch sử khám bệnh',
  'Health Record': 'Hồ sơ sức khỏe',
  
  // Doctor
  'Find Doctor': 'Tìm bác sĩ',
  'Find Doctors': 'Tìm bác sĩ',
  'Doctor Name': 'Tên bác sĩ',
  'Specialization': 'Chuyên khoa',
  'Experience': 'Kinh nghiệm',
  'Qualification': 'Bằng cấp',
  
  // Personal Info
  'Full Name': 'Họ và tên',
  'Email': 'Email',
  'Phone': 'Số điện thoại',
  'Address': 'Địa chỉ',
  'Date of Birth': 'Ngày sinh',
  'Gender': 'Giới tính',
  'Age': 'Tuổi',
  
  // Messages
  'Success': 'Thành công',
  'Error': 'Lỗi',
  'Warning': 'Cảnh báo',
  'Info': 'Thông tin',
  'No data available': 'Không có dữ liệu',
  'No results found': 'Không tìm thấy kết quả',
  'Are you sure?': 'Bạn có chắc chắn?',
  
  // Time
  'Today': 'Hôm nay',
  'Yesterday': 'Hôm qua',
  'Tomorrow': 'Ngày mai',
  'Last 7 days': '7 ngày qua',
  'Last 30 days': '30 ngày qua',
  'This Month': 'Tháng này',
  'This Year': 'Năm nay',
  
  // Stats
  'Total': 'Tổng',
  'Total Appointments': 'Tổng lịch hẹn',
  'Total Patients': 'Tổng bệnh nhân',
  'Total Doctors': 'Tổng bác sĩ',
  'Total Revenue': 'Tổng doanh thu',
  
  // Others
  'Notes': 'Ghi chú',
  'Description': 'Mô tả',
  'Details': 'Chi tiết',
  'Actions': 'Hành động',
  'Select': 'Chọn',
  'Choose': 'Chọn',
  'Password': 'Mật khẩu',
  'Username': 'Tên đăng nhập',
  'Feedback': 'Phản hồi',
  'Rating': 'Đánh giá',
  'Review': 'Đánh giá',
};

// Helper function to translate text
export const t = (key) => {
  return translations[key] || key;
};

// Translate status
export const translateStatus = (status) => {
  const statusMap = {
    'PENDING': 'Đang chờ',
    'CONFIRMED': 'Đã xác nhận',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'ACTIVE': 'Đang hoạt động',
    'INACTIVE': 'Không hoạt động',
  };
  return statusMap[status] || status;
};

// Translate role
export const translateRole = (role) => {
  const roleMap = {
    'PATIENT': 'Bệnh nhân',
    'DOCTOR': 'Bác sĩ',
    'ADMIN': 'Quản trị viên',
  };
  return roleMap[role] || role;
};

export default translations;

