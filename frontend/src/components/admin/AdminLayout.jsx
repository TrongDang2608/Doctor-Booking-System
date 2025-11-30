import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../assets/DoctorBooking.png';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'layout', route: '/admin/dashboard' },
    { path: '/admin/doctors', label: 'Doctors', icon: 'user', route: '/admin/doctors' },
    { path: '/admin/patients', label: 'Patients', icon: 'users', route: '/admin/patients' },
    { path: '/admin/appointments', label: 'Appointments', icon: 'calendar', route: '/admin/appointments' },
    { path: '/admin/feedbacks', label: 'Feedbacks', icon: 'message-circle', route: '/admin/feedbacks' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-layout">
      {/* Background Video */}
      <video 
        className="admin-background-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/backgroundfe.mp4" type="video/mp4" />
      </video>
      
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="logo-icon-wrapper">
              <img 
                src={logoImage} 
                alt="Doctor Booking Logo" 
                className="logo-image"
              />
            </div>
            {sidebarOpen && (
              <div className="logo-text-wrapper">
                <span className="logo-brand-name">Admin Panel</span>
              </div>
            )}
          </Link>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.route}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <i data-feather={item.icon}></i>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-info">
              <div className="user-avatar">
                <i data-feather="user"></i>
              </div>
              <div className="user-details">
                <div className="user-name">{user?.fullName || user?.username}</div>
                <div className="user-role">Administrator</div>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="user-info" style={{ justifyContent: 'center', padding: '0.75rem' }}>
              <div className="user-avatar">
                <i data-feather="user"></i>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <i data-feather="log-out"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="main-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i data-feather={sidebarOpen ? 'chevron-left' : 'chevron-right'}></i>
          </button>
        </div>
        <div className="main-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
