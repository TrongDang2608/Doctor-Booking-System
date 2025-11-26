import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './RequireAuth.css';

const RequireAuth = ({ children, message = 'Bạn cần đăng nhập để sử dụng chức năng này' }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  if (user) {
    return children;
  }

  return (
    <div className="require-auth-container">
      <div className="require-auth-card">
        <div className="require-auth-icon">
          <i data-feather="lock"></i>
        </div>
        <h2 className="require-auth-title">Yêu cầu đăng nhập</h2>
        <p className="require-auth-message">{message}</p>
        <div className="require-auth-actions">
          <Link to="/login" className="require-auth-btn primary">
            <i data-feather="log-in"></i>
            Đăng nhập
          </Link>
          <Link to="/register" className="require-auth-btn secondary">
            <i data-feather="user-plus"></i>
            Đăng ký tài khoản
          </Link>
        </div>
        <p className="require-auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default RequireAuth;

