import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../assets/DoctorBooking.png';
import HealthAIChat from './HealthAIChat';
import AnimatedLogoutButton from '../common/AnimatedLogoutButton';
import './PatientLayout.css';

const PatientLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Mock notifications data (sẽ thay bằng API call sau)
    const [notifications] = useState([
        {
            id: 1,
            type: 'appointment_reminder',
            title: 'Nhắc lịch khám',
            message: 'Bạn có lịch khám với Bác sĩ Nguyễn Văn A vào ngày mai lúc 09:00',
            time: '2 giờ trước',
            read: false,
            appointmentId: 123
        },
        {
            id: 2,
            type: 'appointment_reminder',
            title: 'Nhắc lịch khám',
            message: 'Bạn có lịch khám với Bác sĩ Trần Thị B vào 1 giờ nữa',
            time: '30 phút trước',
            read: false,
            appointmentId: 124
        },
        {
            id: 3,
            type: 'appointment_confirmed',
            title: 'Xác nhận lịch khám',
            message: 'Lịch khám của bạn đã được xác nhận thành công',
            time: '1 ngày trước',
            read: true,
            appointmentId: 125
        },
        {
            id: 4,
            type: 'payment_success',
            title: 'Thanh toán thành công',
            message: 'Bạn đã thanh toán thành công cho lịch khám #126',
            time: '2 ngày trước',
            read: true,
            appointmentId: 126
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

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

    // Initialize Feather Icons after render
    useEffect(() => {
        const timer = setTimeout(() => {
            if (window.feather) {
                window.feather.replace();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [notificationsOpen]); // Re-initialize when notifications dropdown opens/closes

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/patient/dashboard', label: 'Bảng điều khiển', icon: 'layout', route: '/patient/dashboard' },
        { path: '/patient/booking', label: 'Đặt lịch mới', icon: 'calendar', route: '/patient/booking' },
        { path: '/patient/history', label: 'Lịch sử đặt lịch', icon: 'clock', route: '/patient/history' },
        { path: '/patient/doctors', label: 'Tìm bác sĩ', icon: 'search', route: '/patient/doctors' },
        { path: '/patient/family', label: 'Hồ sơ Gia đình', icon: 'users', route: '/patient/family' },
        { path: '/patient/wallet', label: 'Ví Sức khỏe', icon: 'credit-card', route: '/patient/wallet' },
        { path: '/patient/healthlyai', label: 'Trợ lý AI', icon: 'message-circle', route: '/patient/healthlyai' },
    ];

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsOpen && !event.target.closest('.notification-container')) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [notificationsOpen]);

    return (
        <div className="patient-layout">
            {/* Background Video */}
            <video 
                className="patient-background-video"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/backgroundfe.mp4" type="video/mp4" />
            </video>
            
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
                                <span className="logo-brand-name">Bệnh Nhân</span>
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
                                <div className="user-role">Hồ sơ</div>
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
                    <div className="animated-logout-wrapper">
                        <AnimatedLogoutButton 
                            onLogout={handleLogout} 
                            variant="transparent"
                            showText={sidebarOpen}
                        />
                    </div>
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
                    
                    {/* Notification Bell */}
                    <div className="notification-container">
                        <button 
                            className="notification-bell"
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            aria-label="Thông báo"
                        >
                            <i data-feather="bell"></i>
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {notificationsOpen && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <h3>Thông báo</h3>
                                    {unreadCount > 0 && (
                                        <span className="unread-count">{unreadCount} chưa đọc</span>
                                    )}
                                </div>
                                
                                <div className="notification-list">
                                    {notifications.length === 0 ? (
                                        <div className="notification-empty">
                                            <i data-feather="bell-off"></i>
                                            <p>Chưa có thông báo nào</p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div 
                                                key={notification.id}
                                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                                onClick={() => {
                                                    // Handle notification click (sẽ implement sau)
                                                    console.log('Notification clicked:', notification);
                                                }}
                                            >
                                                <div className="notification-icon">
                                                    {notification.type === 'appointment_reminder' && '⏰'}
                                                    {notification.type === 'appointment_confirmed' && '✓'}
                                                    {notification.type === 'payment_success' && '💳'}
                                                </div>
                                                <div className="notification-content">
                                                    <div className="notification-title">{notification.title}</div>
                                                    <div className="notification-message">{notification.message}</div>
                                                    <div className="notification-time">{notification.time}</div>
                                                </div>
                                                {!notification.read && (
                                                    <div className="notification-dot"></div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                
                                {notifications.length > 0 && (
                                    <div className="notification-footer">
                                        <button className="mark-all-read">
                                            Đánh dấu tất cả đã đọc
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
