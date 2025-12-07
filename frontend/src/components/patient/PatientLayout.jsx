import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../assets/DoctorBooking.png';
import HealthAIChat from './HealthAIChat';
import AnimatedLogoutButton from '../common/AnimatedLogoutButton';
import notificationService from '../../services/notificationService';
import './PatientLayout.css';

const PatientLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Load notifications từ API
    const loadNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const [notificationsData, unreadData] = await Promise.all([
                notificationService.getNotifications(),
                notificationService.getUnreadCount()
            ]);
            setNotifications(notificationsData);
            setUnreadCount(unreadData);
        } catch (err) {
            console.error('❌ Error loading notifications:', err);
            // Không hiển thị error để không làm gián đoạn UX
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Load notifications khi component mount và khi location thay đổi
    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user, location.pathname]);

    // Reload notifications mỗi 30 giây để cập nhật real-time
    useEffect(() => {
        if (!user) return;
        
        const interval = setInterval(() => {
            loadNotifications();
        }, 30000); // 30 giây

        return () => clearInterval(interval);
    }, [user]);

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

    // Handle mark notification as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            // Reload notifications để cập nhật UI
            await loadNotifications();
        } catch (err) {
            console.error('❌ Error marking notification as read:', err);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            // Reload notifications để cập nhật UI
            await loadNotifications();
        } catch (err) {
            console.error('❌ Error marking all as read:', err);
        }
    };

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
                                    {loadingNotifications ? (
                                        <div className="notification-empty">
                                            <div className="loading-spinner-small" style={{ margin: '0 auto 1rem' }}></div>
                                            <p>Đang tải thông báo...</p>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="notification-empty">
                                            <i data-feather="bell-off"></i>
                                            <p>Chưa có thông báo nào</p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div 
                                                key={notification.id}
                                                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                                onClick={() => {
                                                    // Đánh dấu đã đọc khi click
                                                    if (!notification.isRead) {
                                                        handleMarkAsRead(notification.id);
                                                    }
                                                    // Có thể navigate đến appointment detail nếu có appointmentId
                                                    if (notification.appointmentId) {
                                                        navigate(`/patient/history`);
                                                    }
                                                }}
                                            >
                                                <div className="notification-icon">
                                                    {notification.type === 'APPOINTMENT_REMINDER_24H' && '⏰'}
                                                    {notification.type === 'APPOINTMENT_REMINDER_1H' && '⏰'}
                                                    {notification.type === 'APPOINTMENT_CONFIRMED' && '✓'}
                                                    {notification.type === 'PAYMENT_SUCCESS' && '💳'}
                                                    {notification.type === 'APPOINTMENT_CANCELLED' && '❌'}
                                                    {!['APPOINTMENT_REMINDER_24H', 'APPOINTMENT_REMINDER_1H', 'APPOINTMENT_CONFIRMED', 'PAYMENT_SUCCESS', 'APPOINTMENT_CANCELLED'].includes(notification.type) && '📢'}
                                                </div>
                                                <div className="notification-content">
                                                    <div className="notification-title">{notification.title}</div>
                                                    <div className="notification-message">{notification.message}</div>
                                                    <div className="notification-time">{notification.timeAgo || 'Vừa xong'}</div>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="notification-dot"></div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                
                                {notifications.length > 0 && (
                                    <div className="notification-footer">
                                        <button className="mark-all-read" onClick={handleMarkAllAsRead}>
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
