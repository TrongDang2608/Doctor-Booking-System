import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';
import videoBg from '../../assets/625148e1956a6a29189fca52d43d74f576029421.mp4';
import '../Auth.css';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Get role from URL or default to patient
  const role = location.pathname.includes('/admin') ? 'admin' 
    : location.pathname.includes('/doctor') ? 'doctor' 
    : 'patient';
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Add role to registration data
      const registrationData = {
        ...formData,
        role: role.toUpperCase()
      };
      
      await register(registrationData);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Đang đăng ký..." />;
  }

  const roleInfo = {
    admin: {
      title: 'Đăng ký Admin',
      subtitle: 'Tạo tài khoản quản trị',
      icon: 'shield',
      color: '#ef4444',
      note: 'Lưu ý: Tài khoản Admin thường được tạo bởi hệ thống'
    },
    doctor: {
      title: 'Đăng ký Bác sĩ',
      subtitle: 'Đăng ký trở thành đối tác',
      icon: 'user-check',
      color: '#16a34a',
      note: 'Vui lòng điền đầy đủ thông tin để được xét duyệt'
    },
    patient: {
      title: 'Đăng ký Bệnh nhân',
      subtitle: 'Tạo tài khoản miễn phí',
      icon: 'heart',
      color: '#6366f1',
      note: 'Đăng ký miễn phí và bắt đầu đặt lịch ngay'
    }
  };

  const info = roleInfo[role];

  return (
    <div className="auth-container">
      {/* Video Background */}
      <div className="auth-video-wrapper">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="auth-video"
        >
          <source src={videoBg} type="video/mp4" />
        </video>
        <div className="auth-video-overlay"></div>
      </div>

      {/* Auth Content */}
      <div className="auth-content">
        {/* Back to Home Button */}
        <Link to="/" className="auth-back-home">
          <ion-icon name="arrow-back-circle-outline"></ion-icon>
        </Link>
        
        <div className="auth-card">
          {/* Role Header */}
          <div className="auth-role-header" style={{ '--role-color': info.color }}>
            <div className="role-icon-wrapper">
              <i data-feather={info.icon}></i>
            </div>
            <h2 className="auth-title">{info.title}</h2>
            <p className="auth-subtitle">{info.subtitle}</p>
            {info.note && (
              <p className="auth-note">{info.note}</p>
            )}
          </div>

          {/* Error Message */}
          <ErrorMessage message={error} onClose={() => setError('')} />

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Nhập họ và tên đầy đủ"
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-register-username">Tên đăng nhập *</label>
              <input
                id="auth-register-username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                placeholder="Chọn tên đăng nhập"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Nhập địa chỉ email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-register-password">Mật khẩu *</label>
              <input
                id="auth-register-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại (tùy chọn)"
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading} style={{ background: `linear-gradient(135deg, ${info.color} 0%, ${info.color}dd 100%)` }}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="auth-footer-links">
            <p>
              Đã có tài khoản? <Link to={`/login/${role}`}>Đăng nhập ngay</Link>
            </p>
            <p>
              <Link to="/">Về trang chủ</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

