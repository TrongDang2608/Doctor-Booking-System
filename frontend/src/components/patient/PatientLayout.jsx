import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../assets/DoctorBooking.png';
import HealthAIChat from './HealthAIChat';
import './PatientLayout.css';

const PatientLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        // Initialize Feather Icons
        if (window.feather) {
            window.feather.replace();
        }
        // Auto-open chat if on healthlyai route
        if (location.pathname === '/patient/healthlyai') {
            setChatOpen(true);
        } else {
            setChatOpen(false);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/patient/dashboard', label: 'Dashboard', icon: 'layout', route: '/patient/dashboard' },
        { path: '/patient/booking', label: 'New Booking', icon: 'calendar', route: '/patient/booking' },
        { path: '/patient/history', label: 'Booking History', icon: 'clock', route: '/patient/history' },
        { path: '/patient/doctors', label: 'Find Doctors', icon: 'search', route: '/patient/doctors' },
        { path: '/patient/healthlyai', label: 'HealthAI Chat', icon: 'message-circle', route: '/patient/healthlyai' },
    ];

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="patient-layout">
            {/* Sidebar */}
            <aside className={`patient-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
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
                                <span className="logo-brand-name">Doctor Booking</span>
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
                            to="/patient/profile"
                            className={`user-info ${isActive('/patient/profile') ? 'active' : ''}`}
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
                            to="/patient/profile"
                            className={`nav-item ${isActive('/patient/profile') ? 'active' : ''}`}
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
            <main className="patient-main">
                <div className="main-header">
                    <button 
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <i data-feather={sidebarOpen ? 'chevron-left' : 'chevron-right'}></i>
                    </button>
                </div>
                <div className={`main-content ${chatOpen ? 'with-chat' : ''}`}>
                    {children}
                </div>
            </main>

            {/* HealthAI Chat Panel - Only show if NOT on healthlyai route (because HealthAIPage renders it) */}
            {chatOpen && location.pathname !== '/patient/healthlyai' && (
                <HealthAIChat onClose={() => {
                    setChatOpen(false);
                    // Only navigate if not already on a patient route
                    if (!location.pathname.startsWith('/patient/')) {
                        navigate('/patient/dashboard');
                    }
                }} />
            )}
        </div>
    );
};

export default PatientLayout;
