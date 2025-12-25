import React, { useState } from "react";
import Navbar from "../../components/common/Navbar";
import { Link } from "react-router-dom";
import { mockDoctors, mockSpecialties } from "../../data/mockData";
import RequireAuth from "../../components/common/RequireAuth";
import "./PatientDoctors.css";

const PatientDoctors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [telemedicineOnly, setTelemedicineOnly] = useState(false);

  const doctors = mockDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    const matchesTelemedicine =
      !telemedicineOnly || doctor.telemedicine;
    return matchesSearch && matchesSpecialty && matchesTelemedicine;
  });

  return (
    <div className="patient-doctors-page dark">
      <Navbar />
      <div className="doctors-content">
        {/* Header */}
        <div className="doctors-header">
          <h1 className="page-title">Danh sách Bác sĩ</h1>
          <p className="page-subtitle">
            Tìm kiếm và chọn bác sĩ phù hợp với nhu cầu của bạn
          </p>
        </div>
        <div className="doctors-filters">
          <div className="search-box">
            <i data-feather="search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ, bệnh viện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Chuyên khoa:</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả</option>
              {mockSpecialties.map((specialty) => (
                <option key={specialty.id} value={specialty.name}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={telemedicineOnly}
              onChange={(e) => setTelemedicineOnly(e.target.checked)}
            />
            <span>Chỉ hiển thị bác sĩ hỗ trợ khám từ xa</span>
          </label>
        </div>
        <div className="results-count">
          Tìm thấy <strong>{doctors.length}</strong> bác sĩ
        </div>
        <div className="doctors-grid">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-avatar-large">{doctor.avatar}</div>
              <div className="doctor-info">
                <h3 className="doctor-name">{doctor.name}</h3>
                <p className="doctor-specialty">{doctor.specialty}</p>
                <p className="doctor-hospital">{doctor.hospital}</p>
                <div className="doctor-stats">
                  <div className="stat-item">
                    <i data-feather="star"></i>
                    <span>{doctor.rating}</span>
                    <span className="stat-label">({doctor.reviews} đánh giá)</span>
                  </div>
                  <div className="stat-item">
                    <i data-feather="briefcase"></i>
                    <span>{doctor.experience} năm</span>
                  </div>
                </div>
                <div className="doctor-badges">
                  {doctor.badges.map((badge, idx) => (
                    <span key={idx} className="badge">{badge}</span>
                  ))}
                  {doctor.telemedicine && (
                    <span className="badge telemedicine">📹 Khám từ xa</span>
                  )}
                </div>
                <div className="doctor-price">
                  {doctor.price.toLocaleString("vi-VN")}đ / lượt khám
                </div>
                <RequireAuth message="Bạn cần đăng nhập để đặt lịch khám với bác sĩ này">
                  <Link
                    to={`/doctors/${doctor.id}/book`}
                    className="doctor-book-btn"
                  >
                    <i data-feather="calendar"></i>
                    Đặt lịch ngay
                  </Link>
                </RequireAuth>
              </div>
            </div>
          ))}
        </div>
        {doctors.length === 0 && (
          <div className="no-results">
            <i data-feather="search"></i>
            <p>Không tìm thấy bác sĩ phù hợp. Vui lòng thử lại với bộ lọc khác.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDoctors;
