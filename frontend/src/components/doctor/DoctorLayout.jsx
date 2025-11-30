import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../assets/DoctorBooking.png';
import './DoctorLayout.css';

const DoctorLayout = ({ children }) => {
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
        { path: '/doctor/dashboard', label: 'Dashboard', icon: 'layout', route: '/doctor/dashboard' },
        { path: '/doctor/profile', label: 'My Profile', icon: 'user', route: '/doctor/profile' },
        { path: '/doctor/appointments', label: 'Appointments', icon: 'calendar', route: '/doctor/appointments' },
        { path: '/doctor/patients', label: 'Search Patients', icon: 'search', route: '/doctor/patients' },
    ];

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="doctor-layout">
            {/* Background Video */}
            <video 
                className="doctor-background-video"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/backgroundfe.mp4" type="video/mp4" />
            </video>
            
            {/* Sidebar */}
            <aside className={`doctor-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
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
                                <span className="logo-brand-name">Doctor Panel</span>
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
                        <Link
                            to="/doctor/profile"
                            className={`user-info ${isActive('/doctor/profile') ? 'active' : ''}`}
                        >
                            <div className="user-avatar">
                                <i data-feather="user"></i>
                            </div>
                            <div className="user-details">
                                <div className="user-name">{user?.fullName || user?.username}</div>
                                <div className="user-role">My Profile</div>
                            </div>
                            <i data-feather="chevron-right" className="user-arrow"></i>
                        </Link>
                    )}
                    {!sidebarOpen && (
                        <Link
                            to="/doctor/profile"
                            className={`nav-item ${isActive('/doctor/profile') ? 'active' : ''}`}
                            style={{ marginBottom: '0.75rem' }}
                        >
                            <i data-feather="user"></i>
                        </Link>
                    )}
                    <button className="logout-btn" onClick={handleLogout}>
                        <i data-feather="log-out"></i>
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="doctor-main">
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

export default DoctorLayout;
