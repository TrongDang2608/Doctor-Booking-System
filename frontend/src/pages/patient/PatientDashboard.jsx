import { useEffect, useState, useMemo } from 'react';
import PatientLayout from '../../components/patient/PatientLayout';
import { patientService } from '../../services/patientService';
import Loading from '../../components/common/Loading';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalAppointments: 0,
    totalTreatments: 0,
    pendingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [appointmentTrend, setAppointmentTrend] = useState([]);

  useEffect(() => {
    loadStats();
    loadRecentActivity();
    generateTrendData();
    
    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      generateTrendData();
      if (window.feather) {
        window.feather.replace();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setError('');
      const [appointments, treatments] = await Promise.all([
        patientService.getAppointments(),
        patientService.getTreatments(),
      ]);

      const upcoming = appointments.filter(a => 
        a.status !== 'CANCELLED' && 
        a.status !== 'COMPLETED' &&
        new Date(a.appointmentDate) >= new Date()
      );

      const pending = appointments.filter(a => a.status === 'PENDING');

      setStats({
        upcomingAppointments: upcoming.length,
        totalAppointments: appointments.length,
        totalTreatments: treatments.length,
        pendingAppointments: pending.length,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Không thể tải thống kê bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const appointments = await patientService.getAppointments();
      const recent = appointments
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
        .slice(0, 5);
      setRecentActivity(recent);
    } catch (err) {
      console.error('Error loading recent activity:', err);
    }
  };

  const generateTrendData = () => {
    // Generate mock trend data for last 7 days
    const days = 7;
    const trend = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 10) + stats.totalAppointments - 5,
      });
    }
    setAppointmentTrend(trend);
  };

  const kpiCards = useMemo(() => [
    { 
      label: 'Lịch hẹn sắp tới', 
      value: stats.upcomingAppointments, 
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      icon: 'calendar',
      trend: '+12%',
      trendUp: true
    },
    { 
      label: 'Tổng lịch hẹn', 
      value: stats.totalAppointments, 
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      icon: 'clipboard',
      trend: '+8%',
      trendUp: true
    },
    { 
      label: 'Điều trị của tôi', 
      value: stats.totalTreatments, 
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      icon: 'activity',
      trend: '+5%',
      trendUp: true
    },
    { 
      label: 'Đang chờ', 
      value: stats.pendingAppointments, 
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: 'clock',
      trend: '-3%',
      trendUp: false
    },
  ], [stats]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'COMPLETED':
        return '#3B82F6';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PENDING':
        return 'Đang chờ';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <PatientLayout>
        <Loading />
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="futuristic-dashboard">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">Bảng điều khiển</h1>
            <p className="dashboard-subtitle">Phân tích & Thông tin Sức khỏe</p>
          </div>
          <div className="header-right">
            <div className="search-container">
              <i data-feather="search" className="search-icon"></i>
              <input 
                type="text" 
                placeholder="Tìm lịch hẹn, bác sĩ..." 
                className="global-search"
              />
            </div>
            <div className="notification-bell">
              <i data-feather="bell"></i>
              <span className="notification-dot"></span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert-error">
            <i data-feather="alert-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="kpi-grid">
          {kpiCards.map((card, index) => (
            <div key={index} className="kpi-card" style={{ '--card-color': card.color }}>
              <div className="kpi-card-header">
                <div className="kpi-icon-wrapper" style={{ background: card.gradient }}>
                  <i data-feather={card.icon}></i>
                </div>
                <div className={`kpi-trend ${card.trendUp ? 'up' : 'down'}`}>
                  <i data-feather={card.trendUp ? 'trending-up' : 'trending-down'}></i>
                  <span>{card.trend}</span>
                </div>
              </div>
              <div className="kpi-content">
                <div className="kpi-value" style={{ color: card.color }}>
                  {card.value}
                </div>
                <div className="kpi-label">{card.label}</div>
              </div>
              {/* Sparkline */}
              <div className="sparkline-container">
                <svg className="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={card.color} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={card.color} stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <polyline
                    points={appointmentTrend.map((point, i) => 
                      `${(i / (appointmentTrend.length - 1)) * 100},${30 - (point.value / Math.max(...appointmentTrend.map(p => p.value))) * 25}`
                    ).join(' ')}
                    fill={`url(#gradient-${index})`}
                    stroke={card.color}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Pulse dot at end */}
                  <circle
                    cx={100}
                    cy={30 - (appointmentTrend[appointmentTrend.length - 1]?.value / Math.max(...appointmentTrend.map(p => p.value))) * 25}
                    r="3"
                    fill={card.color}
                    className="pulse-dot"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Line Chart Section */}
          <div className="chart-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Xu hướng lịch hẹn</h3>
                <p className="card-subtitle">7 ngày qua</p>
              </div>
              <div className="card-actions">
                <button className="icon-btn">
                  <i data-feather="more-horizontal"></i>
                </button>
              </div>
            </div>
            <div className="chart-container">
              <svg className="line-chart" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y * 2}
                    x2="800"
                    y2={y * 2}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                  />
                ))}
                {/* Area */}
                <path
                  d={`M 0,200 ${appointmentTrend.map((point, i) => 
                    `L ${(i / (appointmentTrend.length - 1)) * 800},${200 - (point.value / Math.max(...appointmentTrend.map(p => p.value))) * 150}`
                  ).join(' ')} L 800,200 Z`}
                  fill="url(#chartGradient)"
                />
                {/* Line */}
                <polyline
                  points={appointmentTrend.map((point, i) => 
                    `${(i / (appointmentTrend.length - 1)) * 800},${200 - (point.value / Math.max(...appointmentTrend.map(p => p.value))) * 150}`
                  ).join(' ')}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Data points */}
                {appointmentTrend.map((point, i) => (
                  <circle
                    key={i}
                    cx={(i / (appointmentTrend.length - 1)) * 800}
                    cy={200 - (point.value / Math.max(...appointmentTrend.map(p => p.value))) * 150}
                    r="4"
                    fill="#3B82F6"
                    className="chart-point"
                  />
                ))}
                {/* Pulse dot at end */}
                {appointmentTrend.length > 0 && (
                  <circle
                    cx={800}
                    cy={200 - (appointmentTrend[appointmentTrend.length - 1]?.value / Math.max(...appointmentTrend.map(p => p.value))) * 150}
                    r="6"
                    fill="#3B82F6"
                    className="pulse-dot-large"
                  />
                )}
              </svg>
            </div>
            <div className="chart-legend">
              {appointmentTrend.map((point, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-date">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="legend-value">{point.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Hoạt động gần đây</h3>
                <p className="card-subtitle">Lịch hẹn mới nhất</p>
              </div>
            </div>
            <div className="activity-list">
              {recentActivity.length === 0 ? (
                <div className="empty-state">
                  <i data-feather="inbox"></i>
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-indicator" style={{ background: getStatusColor(activity.status) }}></div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.doctorName}</div>
                      <div className="activity-meta">
                        {new Date(activity.appointmentDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} • {activity.appointmentTime}
                      </div>
                    </div>
                    <div className="activity-status" style={{ color: getStatusColor(activity.status) }}>
                      {getStatusLabel(activity.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Appointment History</h3>
              <p className="card-subtitle">Complete appointment records</p>
            </div>
            <div className="card-actions">
              <button className="icon-btn">
                <i data-feather="download"></i>
              </button>
              <button className="icon-btn">
                <i data-feather="filter"></i>
              </button>
            </div>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Specialization</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table">
                      <i data-feather="inbox"></i>
                      <span>No appointments found</span>
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((appointment, index) => (
                    <tr key={index} className="table-row">
                      <td>
                        <div className="table-cell-content">
                          <div className="table-primary">{appointment.doctorName}</div>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-content">
                          {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-content">
                          <span className="monospace">{appointment.appointmentTime}</span>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-content">
                          <span 
                            className="status-badge" 
                            style={{ 
                              background: `${getStatusColor(appointment.status)}20`,
                              color: getStatusColor(appointment.status),
                              borderColor: getStatusColor(appointment.status)
                            }}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-content">
                          {appointment.doctorSpecialization || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="actions-grid">
          <a href="/patient/booking" className="action-card">
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}>
              <i data-feather="calendar"></i>
            </div>
            <div className="action-content">
              <div className="action-title">Book Appointment</div>
              <div className="action-subtitle">Schedule a new visit</div>
            </div>
            <i data-feather="chevron-right" className="action-arrow"></i>
          </a>
          <a href="/patient/history" className="action-card">
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
              <i data-feather="clock"></i>
            </div>
            <div className="action-content">
              <div className="action-title">View History</div>
              <div className="action-subtitle">Past appointments</div>
            </div>
            <i data-feather="chevron-right" className="action-arrow"></i>
          </a>
          <a href="/patient/feedbacks" className="action-card">
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
              <i data-feather="star"></i>
            </div>
            <div className="action-content">
              <div className="action-title">Đánh giá của tôi</div>
              <div className="action-subtitle">Xem & chỉnh sửa phản hồi</div>
            </div>
            <i data-feather="chevron-right" className="action-arrow"></i>
          </a>
          <a href="/patient/doctors" className="action-card">
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}>
              <i data-feather="search"></i>
            </div>
            <div className="action-content">
              <div className="action-title">Find Doctors</div>
              <div className="action-subtitle">Browse specialists</div>
            </div>
            <i data-feather="chevron-right" className="action-arrow"></i>
          </a>
          <a href="/patient/treatments" className="action-card">
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
              <i data-feather="activity"></i>
            </div>
            <div className="action-content">
              <div className="action-title">My Treatments</div>
              <div className="action-subtitle">Treatment records</div>
            </div>
            <i data-feather="chevron-right" className="action-arrow"></i>
          </a>
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;
