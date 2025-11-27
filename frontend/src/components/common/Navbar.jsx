import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserInfo from './UserInfo';
import logoImage from '../../assets/DoctorBooking.png';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, [user]);

  const menuItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/doctors', label: 'Bác sĩ' },
    { path: '/specialties', label: 'Chuyên khoa' },
    { path: '/about', label: 'Về chúng tôi' },
    { path: '/contact', label: 'Liên hệ' }
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon-wrapper">
            <img 
              src={logoImage} 
              alt="Doctor Booking Logo" 
              className="logo-image"
            />
          </div>
          <div className="logo-text-wrapper">
            <span className="logo-brand-name">Doctor Booking</span>
          </div>
        </Link>

        {/* Menu Items */}
        <ul className="navbar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className="navbar-link">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              {/* Booking Button - Only show for PATIENT role */}
              {user.role === 'PATIENT' && (
                <Link 
                  to="/patient/dashboard" 
                  className="navbar-booking-btn"
                >
                  <i data-feather="calendar"></i>
                  Đặt lịch
                </Link>
              )}
              <UserInfo />
            </>
          ) : (
            <>
              {/* Login Button */}
              <Link to="/login" className="navbar-login-btn">
                <i data-feather="user"></i>
                Đăng nhập
              </Link>

              {/* Register Button */}
              <Link to="/register" className="navbar-booking-btn">
                <i data-feather="user-plus"></i>
                Đăng ký ngay
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

