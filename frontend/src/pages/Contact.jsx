import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <Navbar />
      
      <div className="contact-content">
        <div className="contact-hero">
          <h1 className="contact-title">Liên hệ với chúng tôi</h1>
          <p className="contact-subtitle">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>

        <div className="contact-wrapper">
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">
                <i data-feather="map-pin"></i>
              </div>
              <h3>Địa chỉ</h3>
              <p>123 Đường ABC, Quận XYZ<br />Thành phố Hà Nội, Việt Nam</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i data-feather="phone"></i>
              </div>
              <h3>Điện thoại</h3>
              <p>Hotline: 1900 1234<br />Hỗ trợ 24/7</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i data-feather="mail"></i>
              </div>
              <h3>Email</h3>
              <p>support@doctorbooking.vn<br />info@doctorbooking.vn</p>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <i data-feather="clock"></i>
              </div>
              <h3>Giờ làm việc</h3>
              <p>Thứ 2 - Chủ nhật<br />24/7</p>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Gửi tin nhắn cho chúng tôi</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Họ và tên *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Nhập email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Chủ đề *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Nhập chủ đề"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Nội dung *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Nhập nội dung tin nhắn"
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              <i data-feather="send"></i>
              Gửi tin nhắn
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

