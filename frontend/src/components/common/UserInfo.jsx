import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedLogoutButton from './AnimatedLogoutButton';
import './UserInfo.css';

const UserInfo = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'DOCTOR':
        return 'Bác sĩ';
      case 'PATIENT':
        return 'Bệnh nhân';
      default:
        return 'Người dùng';
    }
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'PATIENT':
        return '/patient/dashboard';
      default:
        return '/';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="user-info-container" ref={dropdownRef}>
      <button
        className="user-info-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="user-avatar-circle">
          {getInitials(user.fullName || user.username)}
        </div>
        <div className="user-info-text">
          <span className="user-name">{user.fullName || user.username}</span>
          <span className="user-role">{getRoleLabel(user.role)}</span>
        </div>
        <i data-feather="chevron-down" className={`chevron-icon ${isOpen ? 'open' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="user-info-dropdown">
          <div className="user-info-header">
            <div className="user-avatar-circle large">
              {getInitials(user.fullName || user.username)}
            </div>
            <div className="user-info-details">
              <div className="user-name-large">{user.fullName || user.username}</div>
              <div className="user-email">{user.email}</div>
              <div className="user-role-badge">{getRoleLabel(user.role)}</div>
            </div>
          </div>

          <div className="user-info-divider"></div>

          <div className="user-info-menu">
            <button
              className="user-info-menu-item"
              onClick={() => {
                navigate(getDashboardPath());
                setIsOpen(false);
              }}
            >
              <i data-feather="layout"></i>
              <span>Bảng điều khiển</span>
            </button>
            <button
              className="user-info-menu-item"
              onClick={() => {
                navigate('/patient/bookings');
                setIsOpen(false);
              }}
            >
              <i data-feather="calendar"></i>
              <span>Lịch hẹn của tôi</span>
            </button>
            <button
              className="user-info-menu-item"
              onClick={() => {
                navigate('/patient/profile');
                setIsOpen(false);
              }}
            >
              <i data-feather="user"></i>
              <span>Thông tin cá nhân</span>
            </button>
          </div>

          <div className="user-info-divider"></div>

          <div className="user-info-logout-wrapper">
            <AnimatedLogoutButton 
              onLogout={handleLogout}
              variant="danger"
              showText={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;

