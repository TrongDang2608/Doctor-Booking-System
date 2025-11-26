import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../assets/DoctorBooking.png';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeColumns, setActiveColumns] = useState(new Set());

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const toggleColumn = (columnId) => {
    setActiveColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', email);
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Column 1: Brand & Contact */}
          <div className="footer-column footer-brand">
            <div className="footer-logo">
              <img src={logoImage} alt="Doctor Booking Logo" className="footer-logo-image" />
              <div className="footer-logo-text">
                <h3 className="footer-brand-name">Doctor Booking</h3>
                <p className="footer-slogan">Chăm sóc sức khỏe của bạn một cách thông minh, tiện lợi, nhanh chóng</p>
              </div>
            </div>
            <div className="footer-contact">
              <div className="contact-item">
                <i data-feather="map-pin"></i>
                <span>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
              </div>
              <div className="contact-item">
                <i data-feather="mail"></i>
                <a href="mailto:support@doctorbooking.com">support@doctorbooking.com</a>
              </div>
              <div className="contact-item">
                <i data-feather="phone"></i>
                <a href="tel:+84123456789">+84 123 456 789</a>
              </div>
            </div>
          </div>

          {/* Column 2: Services */}
          <div className={`footer-column ${activeColumns.has('services') ? 'active' : ''}`}>
            <h4 
              className="footer-column-title"
              onClick={() => toggleColumn('services')}
            >
              Dịch vụ
            </h4>
            <ul className="footer-links">
              <li><Link to="/doctors">Tìm bác sĩ</Link></li>
              <li><Link to="/specialties">Chuyên khoa</Link></li>
              <li><Link to="/appointments">Đặt lịch khám</Link></li>
              <li><Link to="/consultation">Tư vấn trực tuyến</Link></li>
              <li><Link to="/health-check">Khám sức khỏe</Link></li>
            </ul>
          </div>

          {/* Column 3: Company & Support */}
          <div className={`footer-column ${activeColumns.has('company') ? 'active' : ''}`}>
            <h4 
              className="footer-column-title"
              onClick={() => toggleColumn('company')}
            >
              Công ty
            </h4>
            <ul className="footer-links">
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/news">Tin tức</Link></li>
              <li><Link to="/careers">Tuyển dụng</Link></li>
              <li><Link to="/partners">Đối tác</Link></li>
            </ul>
            <h4 
              className="footer-column-title footer-column-title-spacing"
              onClick={() => toggleColumn('support')}
            >
              Hỗ trợ
            </h4>
            <ul className={`footer-links ${activeColumns.has('support') ? 'active' : ''}`}>
              <li><Link to="/help">Trung tâm trợ giúp</Link></li>
              <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/guides">Hướng dẫn sử dụng</Link></li>
            </ul>
          </div>

          {/* Column 4: Social & Newsletter */}
          <div className="footer-column footer-social">
            <h4 className="footer-column-title">Kết nối với chúng tôi</h4>
            <div className="footer-social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <i data-feather="facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
                <i data-feather="twitter"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                <i data-feather="linkedin"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
                <i data-feather="youtube"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <i data-feather="instagram"></i>
              </a>
            </div>

            <div className="footer-newsletter">
              <h4 className="footer-column-title">Đăng ký nhận tin</h4>
              <p className="newsletter-desc">Nhận thông tin mới nhất về sức khỏe và dịch vụ</p>
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-button">
                  <i data-feather="send"></i>
                  <span>Đăng ký</span>
                </button>
              </form>
              {isSubscribed && (
                <p className="newsletter-success">Cảm ơn bạn đã đăng ký!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="footer-sub">
          <div className="footer-sub-left">
            <p className="footer-copyright">
              © {currentYear} Doctor Booking. All rights reserved.
            </p>
          </div>
          <div className="footer-sub-right">
            <Link to="/privacy" className="footer-legal-link">Chính sách bảo mật</Link>
            <span className="footer-separator">|</span>
            <Link to="/terms" className="footer-legal-link">Điều khoản sử dụng</Link>
            <span className="footer-separator">|</span>
            <Link to="/cookies" className="footer-legal-link">Chính sách Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

