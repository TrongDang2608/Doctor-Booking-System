import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import Logo from '../components/common/Logo';
import videoBg from '../assets/625148e1956a6a29189fca52d43d74f576029421.mp4';
import './Auth.css';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  // Determine initial mode from URL
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Login state
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  
  // Register state
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync with URL changes
  useEffect(() => {
    const shouldBeLogin = location.pathname === '/login';
    if (shouldBeLogin !== isLogin) {
      handleModeSwitch(shouldBeLogin);
    }
  }, [location.pathname]);

  const handleModeSwitch = (toLogin) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsLogin(toLogin);
      setError('');
      setIsTransitioning(false);
    }, 300);
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authResponse = await login(loginData.username, loginData.password);
      
      const logPersistent = (msg, data) => {
        console.log(msg, data || '');
        if (!window.debugLogs) window.debugLogs = [];
        window.debugLogs.push({ timestamp: new Date().toISOString(), message: msg, data });
      };
      
      logPersistent('✅ Login successful - Response:', authResponse);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const role = authResponse?.role || JSON.parse(localStorage.getItem('user') || '{}')?.role;
      logPersistent('🔍 Role determined:', role);
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      logPersistent('💾 Storage check:', { 
        hasToken: !!token, 
        hasUser: !!user, 
        userRole: user?.role 
      });
      
      if (!role) {
        logPersistent('❌ No role found!', { authResponse, user });
        setError('Login failed: Role information missing');
        return;
      }
      
      let redirectPath = '/patient/dashboard';
      if (role === 'ADMIN') {
        redirectPath = '/admin/dashboard';
      } else if (role === 'DOCTOR') {
        redirectPath = '/doctor/dashboard';
      }
      
      logPersistent('🚀 Redirecting to:', redirectPath);
      navigate(redirectPath);
    } catch (err) {
      console.error('❌ Login error:', err);
      if (!window.debugLogs) window.debugLogs = [];
      window.debugLogs.push({ 
        timestamp: new Date().toISOString(), 
        message: 'Login error', 
        error: err 
      });
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(registerData);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message={isLogin ? "Logging in..." : "Registering..."} />;
  }

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
        
        <div className={`auth-card ${isTransitioning ? 'transitioning' : ''} ${isLogin ? 'login-mode' : 'register-mode'}`}>
          {/* Logo */}
          <div className="auth-logo">
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
              <Logo size="medium" showSubtitle={true} />
            </Link>
          </div>
          
          {/* Mode Toggle */}
          <div className="auth-mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => {
                navigate('/login');
                handleModeSwitch(true);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                navigate('/register');
                handleModeSwitch(false);
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          <ErrorMessage message={error} onClose={() => setError('')} />

          {/* Login Form */}
          <div className={`auth-form-wrapper ${isLogin ? 'active' : ''}`}>
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Sign in to your account</p>

              <div className="form-group">
                <label htmlFor="login-username">Username or Email</label>
                <input
                  id="login-username"
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  required
                  placeholder="Enter your username or email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Register Form */}
          <div className={`auth-form-wrapper ${!isLogin ? 'active' : ''}`}>
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-subtitle">Sign up to get started</p>

              <div className="form-group">
                <label htmlFor="register-fullName">Full Name *</label>
                <input
                  id="register-fullName"
                  type="text"
                  name="fullName"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-username">Username *</label>
                <input
                  id="register-username"
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  required
                  minLength={3}
                  placeholder="Choose a username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email">Email *</label>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password">Password *</label>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  minLength={6}
                  placeholder="Create a password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-phone">Phone</label>
                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  placeholder="Enter your phone number (optional)"
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

