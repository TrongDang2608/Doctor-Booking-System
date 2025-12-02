import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    pendingFeedbacks: 0,
    recentAppointments: [],
    appointmentsByStatus: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError('');
      const [doctors, patients, appointments, feedbacks] = await Promise.all([
        adminService.getAllDoctors(),
        adminService.searchPatients(),
        adminService.getAllAppointments(),
        adminService.getAllFeedbacks('PENDING'),
      ]);

      // Calculate appointment status breakdown
      const statusCount = appointments.reduce((acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        pendingFeedbacks: feedbacks.length,
        recentAppointments: appointments.slice(0, 5),
        appointmentsByStatus: statusCount,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = useMemo(() => [
    { 
      label: 'Total Doctors', 
      value: stats.totalDoctors, 
      icon: '👨‍⚕️',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      change: '+12%',
      trend: 'up'
    },
    { 
      label: 'Total Patients', 
      value: stats.totalPatients, 
      icon: '👥',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      change: '+8%',
      trend: 'up'
    },
    { 
      label: 'Total Appointments', 
      value: stats.totalAppointments, 
      icon: '📅',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      change: '+23%',
      trend: 'up'
    },
    { 
      label: 'Pending Feedbacks', 
      value: stats.pendingFeedbacks, 
      icon: '💬',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      change: stats.pendingFeedbacks > 0 ? 'Action needed' : 'All clear',
      trend: stats.pendingFeedbacks > 0 ? 'warning' : 'good'
    },
  ], [stats]);

  const quickActions = [
    { label: 'Manage Doctors', icon: '👨‍⚕️', path: '/admin/doctors', color: '#667eea' },
    { label: 'View Patients', icon: '👥', path: '/admin/patients', color: '#f5576c' },
    { label: 'Appointments', icon: '📅', path: '/admin/appointments', color: '#00f2fe' },
    { label: 'Feedbacks', icon: '💬', path: '/admin/feedbacks', color: '#fee140' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700"
            onClick={loadStats}
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <span className="text-lg">⚠️</span>
            <span className="flex-1">{error}</span>
            <button 
              className="text-red-800 hover:text-red-900 font-bold text-xl leading-none"
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div 
              key={index} 
              className="relative overflow-hidden rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200"
              style={{ background: card.gradient }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white/80 text-sm font-medium mb-1">{card.label}</p>
                  <p className="text-4xl font-bold mb-2">{card.value}</p>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {card.trend === 'up' && <span>↗</span>}
                    {card.trend === 'warning' && <span>⚠️</span>}
                    {card.trend === 'good' && <span>✓</span>}
                    <span>{card.change}</span>
                  </div>
                </div>
                <div className="text-5xl opacity-20">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(action.path)}
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Appointment Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Status</h2>
            <div className="space-y-3">
              {Object.entries(stats.appointmentsByStatus).map(([status, count]) => {
                const colors = {
                  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
                  completed: 'bg-green-100 text-green-800 border-green-200',
                  cancelled: 'bg-red-100 text-red-800 border-red-200',
                };
                const colorClass = colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
                
                return (
                  <div key={status} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${colorClass}`}>
                    <span className="font-semibold text-sm uppercase tracking-wide">{status}</span>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Appointments</h2>
            <button 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
              onClick={() => navigate('/admin/appointments')}
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentAppointments.length > 0 ? (
              stats.recentAppointments.map((apt) => {
                const statusColors = {
                  pending: 'bg-yellow-100 text-yellow-800',
                  confirmed: 'bg-blue-100 text-blue-800',
                  completed: 'bg-green-100 text-green-800',
                  cancelled: 'bg-red-100 text-red-800',
                };
                const statusClass = statusColors[apt.status.toLowerCase()] || 'bg-gray-100 text-gray-800';
                
                return (
                  <div key={apt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl">
                      📅
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {apt.patientName} → {apt.doctorName}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusClass}`}>
                      {apt.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <span className="text-5xl mb-3">📭</span>
                <p>No recent appointments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

