import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';
import videoBg from '../assets/625148e1956a6a29189fca52d43d74f576029421.mp4';
import './AuthUnified.css';

const AuthUnified = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register } = useAuth();

  useEffect(() => {
    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }
    
    document.body.style.background = '#0f172a';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.background = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const shouldBeSignUp = location.pathname === '/register';
    if (shouldBeSignUp !== isSignUp) {
      setIsSignUp(shouldBeSignUp);
    }
  }, [location.pathname, isSignUp]);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, [isSignUp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      // Register validation
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }

      setLoading(true);
      try {
        const userData = {
          username: username || email,
          email: email,
          password: password,
          fullName: fullName,
          phone: phone,
          role: 'PATIENT'
        };
        await register(userData);
        navigate('/patient/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Đăng ký thất bại');
        setLoading(false);
      }
    } else {
      // Login
      setLoading(true);
      try {
        await login(email, password);
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại');
        setLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    navigate(isSignUp ? '/login' : '/register', { replace: true });
  };

  if (loading) {
    return <Loading message={isSignUp ? 'Đang đăng ký...' : 'Đang đăng nhập...'} />;
  }

  return (
    <div className="auth-unified-wrapper">
      {/* Video Background */}
      <div className="auth-video-wrapper">
        <video className="auth-video" autoPlay loop muted playsInline>
          <source src={videoBg} type="video/mp4" />
        </video>
        <div className="auth-video-overlay"></div>
      </div>

      {/* Back to Home */}
      <Link to="/" className="auth-back-home">
        <i data-feather="arrow-left"></i>
      </Link>

      {/* Login/Register Box */}
      <div className={`login-box ${isSignUp ? 'expanded' : ''}`}>
        <form onSubmit={handleSubmit}>
          <h2>{isSignUp ? 'Đăng Ký' : 'Đăng Nhập'}</h2>

          {/* Error Message */}
          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}

          {/* Full Name - Signup Only */}
          <div className={`input-box ${isSignUp ? 'expanded' : 'collapsed'}`}>
            <span className="icon">
              <i data-feather="user"></i>
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required={isSignUp}
              placeholder=" "
            />
            <label>Họ và tên</label>
          </div>

          {/* Username - Signup Only */}
          <div className={`input-box ${isSignUp ? 'expanded' : 'collapsed'}`}>
            <span className="icon">
              <i data-feather="at-sign"></i>
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={isSignUp}
              placeholder=" "
            />
            <label>Tên đăng nhập</label>
          </div>

          {/* Email/Username */}
          <div className="input-box">
            <span className="icon">
              <i data-feather="mail"></i>
            </span>
            <input
              type={isSignUp ? 'email' : 'text'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder=" "
            />
            <label>{isSignUp ? 'Email' : 'Email hoặc Tên đăng nhập'}</label>
          </div>

          {/* Phone - Signup Only */}
          <div className={`input-box ${isSignUp ? 'expanded' : 'collapsed'}`}>
            <span className="icon">
              <i data-feather="phone"></i>
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={isSignUp}
              placeholder=" "
            />
            <label>Số điện thoại</label>
          </div>

          {/* Password */}
          <div className="input-box">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
            />
            <label>Mật khẩu</label>
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <i data-feather={showPassword ? 'eye-off' : 'eye'}></i>
            </button>
          </div>

          {/* Confirm Password - Signup Only */}
          <div className={`input-box ${isSignUp ? 'expanded' : 'collapsed'}`}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={isSignUp}
              placeholder=" "
            />
            <label>Xác nhận mật khẩu</label>
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              <i data-feather={showConfirmPassword ? 'eye-off' : 'eye'}></i>
            </button>
          </div>

          {/* Submit Button */}
          <button type="submit">
            {isSignUp ? 'Đăng ký' : 'Đăng nhập'}
          </button>

          {/* Toggle Login/Register */}
          <div className="register-link">
            <p>
              {isSignUp ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
              <button type="button" onClick={toggleMode}>
                {isSignUp ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthUnified;
