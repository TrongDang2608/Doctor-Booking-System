import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Feather Icons
    const initIcons = () => {
      if (window.feather) {
        window.feather.replace();
      }
    };
    
    initIcons();
    
    // Set body background to prevent white flash
    document.body.style.background = '#0e1015';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.background = '';
      document.body.style.overflow = '';
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: 'PATIENT' // Default role
      };

      const response = await register(userData);
      
      // Redirect based on role
      if (response.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (response.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Đang đăng ký..." />;
  }

  return (
    <div className="linear-login-page linear-register-page">
      {/* Back to Home Button */}
      <Link to="/" className="linear-back-home">
        <i data-feather="arrow-left"></i>
      </Link>

      <div className="linear-login-container">
        {/* Heading */}
        <h1 className="linear-login-heading">Sign Up For Doctor Booking</h1>

        {/* Error Message */}
        {error && (
          <div className="linear-error-message">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="linear-login-form" autoComplete="on">
          <div className="linear-form-group">
            <input
              type="text"
              name="fullName"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Họ và tên"
              required
              autoFocus
              autoComplete="name"
              className="linear-input"
            />
          </div>

          <div className="linear-form-group">
            <input
              type="text"
              name="username"
              id="linear-register-username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Tên đăng nhập"
              required
              autoComplete="username"
              className="linear-input"
            />
          </div>

          <div className="linear-form-group">
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              autoComplete="email"
              className="linear-input"
            />
          </div>

          <div className="linear-form-group">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Số điện thoại"
              required
              autoComplete="tel"
              className="linear-input"
            />
          </div>

          <div className="linear-form-group">
            <div className="linear-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="linear-register-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mật khẩu"
                required
                autoComplete="new-password"
                className="linear-input"
              />
              <button
                type="button"
                className="linear-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <i data-feather={showPassword ? 'eye-off' : 'eye'}></i>
              </button>
            </div>
          </div>

          <div className="linear-form-group">
            <div className="linear-password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                id="linear-register-confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Xác nhận mật khẩu"
                required
                autoComplete="new-password"
                className="linear-input"
              />
              <button
                type="button"
                className="linear-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                <i data-feather={showConfirmPassword ? 'eye-off' : 'eye'}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="linear-submit-button"
            disabled={loading}
          >
            <span>Đăng ký</span>
          </button>
        </form>

        {/* Footer */}
        <div className="linear-login-footer">
          <p className="linear-footer-text">
            Đã có tài khoản?{' '}
            <Link to="/login" className="linear-footer-link">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
