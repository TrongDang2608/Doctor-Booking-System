import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import logoImage from '../assets/DoctorBooking.png';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      
      // Redirect based on role
      if (response.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (response.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Đang đăng nhập..." />;
  }

  return (
    <div className="linear-login-page">
      {/* Back to Home Button */}
      <Link to="/" className="linear-back-home">
        <i data-feather="arrow-left"></i>
      </Link>

      <div className="linear-login-container">
        {/* Heading */}
        <h1 className="linear-login-heading">Log In To Doctor Booking</h1>

        {/* Error Message */}
        {error && (
          <div className="linear-error-message">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="linear-login-form" autoComplete="on">
          <div className="linear-form-group">
            <input
              type="text"
              name="username"
              id="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập Tên Đăng Nhập"
              required
              autoFocus
              autoComplete="username"
              className="linear-input"
            />
          </div>

          <div className="linear-form-group">
            <div className="linear-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập Mật Khẩu"
                required
                autoComplete="current-password"
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

          <button 
            type="submit" 
            className="linear-submit-button"
            disabled={loading}
          >
            Đăng nhập
          </button>
        </form>

        {/* Footer */}
        <div className="linear-login-footer">
          <p className="linear-footer-text">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="linear-footer-link">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
