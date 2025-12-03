import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedLogoutButton from '../common/AnimatedLogoutButton';

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
    { path: '/admin/dashboard', label: 'Bảng điều khiển', icon: 'layout', route: '/admin/dashboard' },
    { path: '/admin/users', label: 'Người dùng', icon: 'users', route: '/admin/users' },
    { path: '/admin/doctors', label: 'Bác sĩ', icon: 'user', route: '/admin/doctors' },
    { path: '/admin/patients', label: 'Bệnh nhân', icon: 'user-check', route: '/admin/patients' },
    { path: '/admin/appointments', label: 'Lịch hẹn', icon: 'calendar', route: '/admin/appointments' },
    { path: '/admin/feedbacks', label: 'Phản hồi', icon: 'message-circle', route: '/admin/feedbacks' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Header */}
        <div className="px-5 py-6 border-b border-gray-200">
          <div className="flex items-center gap-3 font-semibold text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor" className="w-8 h-8 text-indigo-600">
              <path d="M21 10h-4V6h-2v4h-4v2h4v4h2v-4h4v-2z"/>
              <path d="M28 10h-2V4a2.002 2.002 0 0 0-2-2H8a2.002 2.002 0 0 0-2 2v6H4a2.002 2.002 0 0 0-2 2v18h28V12a2.002 2.002 0 0 0-2-2ZM14 28v-6h4v6Zm6 0v-7a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7H4V12h4V4h16v8h4v16Z"/>
            </svg>
            {sidebarOpen && <span className="text-lg bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Quản Trị Viên</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200 relative ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-600 font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-indigo-600 before:rounded-r'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <i data-feather={item.icon} className="w-5 h-5"></i>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-3 mb-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {(user?.fullName || user?.username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-semibold text-gray-800 truncate">{user?.fullName || user?.username}</div>
                <div className="text-xs text-gray-500">Quản trị viên</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {(user?.fullName || user?.username || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <div className="w-full flex items-center justify-center">
            <AnimatedLogoutButton 
              onLogout={handleLogout} 
              variant="light"
              showText={sidebarOpen}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 flex items-center justify-center"
            aria-label="Toggle sidebar"
          >
            <span className="text-base">{sidebarOpen ? '◀' : '▶'}</span>
          </button>
          
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="w-80 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200"
            />
            <button className="relative w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 flex items-center justify-center">
              <span className="text-lg">🔔</span>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white">3</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
