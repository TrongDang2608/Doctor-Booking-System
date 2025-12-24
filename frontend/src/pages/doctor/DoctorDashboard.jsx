import { useEffect, useState, useMemo } from 'react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { doctorService } from '../../services/doctorService';
import Loading from '../../components/common/Loading';
import StatCard from '../../components/common/StatCard';
import QuickActionCard from '../../components/common/QuickActionCard';
import SimpleChart from '../../components/common/SimpleChart';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalTreatments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError('');
      const today = new Date().toISOString().split('T')[0];
      const [todayApps, allApps, allTreatments] = await Promise.all([
        doctorService.getAppointments(today),
        doctorService.getAppointments(),
        doctorService.getTreatments(),
      ]);

      const pending = allApps.filter(a => a.status === 'PENDING');
      const completed = allApps.filter(a => a.status === 'COMPLETED');
      const cancelled = allApps.filter(a => a.status === 'CANCELLED');
      const upcoming = allApps
        .filter(a =>
          a.status !== 'CANCELLED' &&
          a.status !== 'COMPLETED' &&
          new Date(a.appointmentDate + 'T' + a.appointmentTime) >= new Date()
        )
        .sort((a, b) => {
          const dateA = new Date(a.appointmentDate + 'T' + a.appointmentTime);
          const dateB = new Date(b.appointmentDate + 'T' + b.appointmentTime);
          return dateA - dateB;
        })
        .slice(0, 5);

      setStats({
        todayAppointments: todayApps.length,
        pendingAppointments: pending.length,
        totalTreatments: allTreatments.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        cancelledAppointments: cancelled.length,
      });
      setAppointments(allApps);
      setTreatments(allTreatments);
      setUpcomingAppointments(upcoming);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Không thể tải thống kê bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for appointments (last 7 days)
  const appointmentsChartData = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = appointments.filter(a => a.appointmentDate === dateStr).length;
      const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
      days.push({ label: dayName, value: count });
    }
    return days;
  }, [appointments]);

  // Prepare chart data for treatments (last 7 days)
  const treatmentsChartData = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = treatments.filter(t => {
        if (!t.createdAt) return false;
        const createdDate = new Date(t.createdAt).toISOString().split('T')[0];
        return createdDate === dateStr;
      }).length;
      const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
      days.push({ label: dayName, value: count });
    }
    return days;
  }, [treatments]);

  // Prepare monthly stats
  const monthlyStats = useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toISOString().substring(0, 7);
      const appsCount = appointments.filter(a => a.appointmentDate?.startsWith(monthStr)).length;
      const treatmentsCount = treatments.filter(t => {
        if (!t.createdAt) return false;
        return t.createdAt.startsWith(monthStr);
      }).length;
      const monthName = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'][date.getMonth()];
      months.push({
        label: `${monthName}/${date.getFullYear().toString().slice(-2)}`,
        appointments: appsCount,
        treatments: treatmentsCount
      });
    }
    return months;
  }, [appointments, treatments]);

  const statCards = useMemo(() => [
    {
      label: "Lịch hẹn hôm nay",
      value: stats.todayAppointments,
      color: '#3b82f6',
      icon: 'calendar',
      onClick: () => window.location.href = '/doctor/appointments'
    },
    {
      label: 'Lịch hẹn đang chờ',
      value: stats.pendingAppointments,
      color: '#f59e0b',
      icon: 'clock',
      onClick: () => window.location.href = '/doctor/appointments?status=PENDING'
    },
    {
      label: 'Tổng điều trị',
      value: stats.totalTreatments,
      color: '#10b981',
      icon: 'activity',
      onClick: () => window.location.href = '/doctor/treatments'
    },
    {
      label: 'Đã hoàn thành',
      value: stats.completedAppointments,
      color: '#8b5cf6',
      icon: 'check-circle',
      onClick: () => window.location.href = '/doctor/appointments?status=COMPLETED'
    },
  ], [stats]);

  if (loading) {
    return (
      <DoctorLayout>
        <Loading />
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="doctor-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Bảng Điều Khiển Bác Sĩ
          </h1>
          <p className="dashboard-subtitle">
            Tổng quan hoạt động và thống kê của bạn
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Lịch hẹn 7 ngày qua</h3>
              <span className="chart-subtitle">Theo ngày</span>
            </div>
            <SimpleChart
              data={appointmentsChartData}
              type="bar"
              color="#3b82f6"
              height={220}
            />
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Điều trị 7 ngày qua</h3>
              <span className="chart-subtitle">Theo ngày</span>
            </div>
            <SimpleChart
              data={treatmentsChartData}
              type="line"
              color="#10b981"
              height={220}
            />
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="monthly-stats-card">
          <h3 className="section-title">Thống kê 6 tháng gần đây</h3>
          <div className="monthly-stats-content">
            <div className="monthly-chart">
              <SimpleChart
                data={monthlyStats.map(m => ({ label: m.label, value: m.appointments }))}
                type="bar"
                color="#8b5cf6"
                height={180}
              />
              <p className="chart-legend">Lịch hẹn</p>
            </div>
            <div className="monthly-chart">
              <SimpleChart
                data={monthlyStats.map(m => ({ label: m.label, value: m.treatments }))}
                type="bar"
                color="#10b981"
                height={180}
              />
              <p className="chart-legend">Điều trị</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Upcoming Appointments */}
          <div className="dashboard-card upcoming-appointments-card">
            <div className="card-header">
              <h3 className="card-title">Lịch hẹn sắp tới</h3>
              <a href="/doctor/appointments" className="card-link">Xem tất cả →</a>
            </div>
            <div className="appointments-grid">
              {upcomingAppointments.length === 0 ? (
                <div className="empty-state">
                  <p>Không có lịch hẹn sắp tới</p>
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-card-header">
                      <div className="appointment-date-badge">
                        <span className="appointment-day">{new Date(appointment.appointmentDate).getDate()}</span>
                        <span className="appointment-month">
                          {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'][new Date(appointment.appointmentDate).getMonth()]}
                        </span>
                      </div>
                      <div className={`appointment-status-badge status-${appointment.status.toLowerCase()}`}>
                        {appointment.status === 'PENDING' ? 'Đang chờ' :
                          appointment.status === 'CONFIRMED' ? 'Đã xác nhận' : appointment.status}
                      </div>
                    </div>
                    <div className="appointment-card-body">
                      <div className="appointment-time-display">
                        <i data-feather="clock" style={{ width: '16px', height: '16px', marginRight: '8px' }}></i>
                        <span className="time-text">{formatTime(appointment.appointmentTime)}</span>
                      </div>
                      <div className="appointment-patient">
                        <div className="patient-name">{appointment.patientName}</div>
                        {appointment.patientPhone && (
                          <div className="patient-phone">{appointment.patientPhone}</div>
                        )}
                      </div>
                    </div>
                    <div className="appointment-card-footer">
                      <button
                        className="view-appointment-btn"
                        onClick={() => window.location.href = `/doctor/appointments`}
                      >
                        Xem chi tiết →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card quick-actions-card">
            <div className="card-header">
              <h3 className="card-title">Thao tác nhanh</h3>
            </div>
            <div className="quick-actions-grid">
              <QuickActionCard
                to="/doctor/appointments"
                icon="calendar"
                title="Lịch hẹn"
                description="Xem và quản lý lịch hẹn"
                color="#3b82f6"
              />
              <QuickActionCard
                to="/doctor/treatments"
                icon="activity"
                title="Điều trị"
                description="Quản lý đơn thuốc và điều trị"
                color="#10b981"
              />
              <QuickActionCard
                to="/doctor/patients"
                icon="search"
                title="Tìm bệnh nhân"
                description="Tìm kiếm và xem hồ sơ bệnh nhân"
                color="#8b5cf6"
              />
              <QuickActionCard
                to="/doctor/profile"
                icon="user"
                title="Hồ sơ"
                description="Chỉnh sửa thông tin cá nhân"
                color="#f59e0b"
              />
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
