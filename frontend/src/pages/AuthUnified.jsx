import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/common/ErrorMessage';
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
    const initIcons = () => {
      if (window.feather) {
        window.feather.replace();
      }
    };
    
    initIcons();
    
    // Set body background to prevent white flash
    document.body.style.background = '#0f172a';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.background = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // Sync isSignUp with URL
    const shouldBeSignUp = location.pathname === '/register';
    if (shouldBeSignUp !== isSignUp) {
      setIsSignUp(shouldBeSignUp);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Reinitialize icons when form expands/collapses
    if (window.feather) {
      window.feather.replace();
    }
  }, [isSignUp]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      
      // Redirect to homepage after login
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
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

      const response = await register(userData);
      
      // Redirect to homepage after registration
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = !isSignUp;
    setError('');
    // Clear form when switching
    if (newMode) {
      setFullName('');
      setUsername('');
      setPhone('');
      setConfirmPassword('');
    }
    // Navigate to update URL
    navigate(newMode ? '/register' : '/login', { replace: true });
  };

  if (loading) {
    return <Loading message={isSignUp ? "Đang đăng ký..." : "Đang đăng nhập..."} />;
  }

  return (
    <div className="auth-unified-page">
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

      {/* Back to Home Button */}
      <Link to="/" className="linear-back-home">
        <i data-feather="arrow-left"></i>
      </Link>

      <div className="auth-unified-container">
        <div className={`auth-unified-card ${isSignUp ? 'expanded' : ''}`}>
          {/* Heading */}
          <h1 className="auth-unified-heading">
            <span className={`heading-text ${isSignUp ? 'hide' : 'show'}`}>
              Log In To Doctor Booking
            </span>
            <span className={`heading-text ${isSignUp ? 'show' : 'hide'}`}>
              Sign Up For Doctor Booking
            </span>
          </h1>

          {/* Error Message */}
          {error && (
            <div className="linear-error-message">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Login Form */}
          <form 
            onSubmit={isSignUp ? handleRegister : handleLogin} 
            className="auth-unified-form"
            autoComplete="on"
          >
            {/* Full Name - Only in Sign Up */}
            <div className={`auth-form-field ${isSignUp ? 'expanded' : 'collapsed'}`}>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Họ và tên"
                required={isSignUp}
                autoComplete="name"
                className="linear-input"
              />
            </div>

            {/* Username - Only in Sign Up */}
            <div className={`auth-form-field ${isSignUp ? 'expanded' : 'collapsed'}`}>
              <input
                type="text"
                name="username"
                id="authunified-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                required={isSignUp}
                autoComplete="username"
                className="linear-input"
              />
            </div>

            {/* Email */}
            <div className="auth-form-field">
              <input
                type={isSignUp ? 'email' : 'text'}
                name={isSignUp ? 'email' : 'username'}
                id={isSignUp ? 'email' : 'username'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSignUp ? 'Email' : 'Nhập Tên Đăng Nhập'}
                required
                autoFocus={!isSignUp}
                autoComplete={isSignUp ? 'email' : 'username'}
                className="linear-input"
              />
            </div>

            {/* Phone - Only in Sign Up */}
            <div className={`auth-form-field ${isSignUp ? 'expanded' : 'collapsed'}`}>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại"
                required={isSignUp}
                autoComplete="tel"
                className="linear-input"
              />
            </div>

            {/* Password */}
            <div className="auth-form-field">
              <div className="linear-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="authunified-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập Mật Khẩu"
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
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

            {/* Confirm Password - Only in Sign Up */}
            <div className={`auth-form-field ${isSignUp ? 'expanded' : 'collapsed'}`}>
              <div className="linear-password-wrapper">
                <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                id="authunified-confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu"
                required={isSignUp}
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

            {/* Submit Button */}
            <button 
              type="submit" 
              className="linear-submit-button"
              disabled={loading}
            >
              <span className={`button-text ${isSignUp ? 'hide' : 'show'}`}>
                Đăng nhập
              </span>
              <span className={`button-text ${isSignUp ? 'show' : 'hide'}`}>
                Đăng ký
              </span>
            </button>
          </form>

          {/* Toggle Link */}
          <div className="auth-unified-footer">
            <p className="linear-footer-text">
              {!isSignUp ? (
                <>
                  Chưa có tài khoản?{' '}
                  <button 
                    type="button"
                    onClick={toggleMode}
                    className="linear-footer-link auth-toggle-btn"
                  >
                    Đăng ký
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{' '}
                  <button 
                    type="button"
                    onClick={toggleMode}
                    className="linear-footer-link auth-toggle-btn"
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthUnified;

