import { useEffect, useState, useMemo } from 'react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { doctorService } from '../../services/doctorService';
import Loading from '../../components/common/Loading';
import StatCard from '../../components/common/StatCard';
import ActionButton from '../../components/common/ActionButton';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalTreatments: 0,
    upcomingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError('');
      const today = new Date().toISOString().split('T')[0];
      const [todayApps, allApps, treatments] = await Promise.all([
        doctorService.getAppointments(today),
        doctorService.getAppointments(),
        doctorService.getTreatments(),
      ]);

      const pending = allApps.filter(a => a.status === 'PENDING');
      const upcoming = allApps.filter(a => 
        a.status !== 'CANCELLED' && 
        a.status !== 'COMPLETED' &&
        new Date(a.appointmentDate) >= new Date()
      );

      setStats({
        todayAppointments: todayApps.length,
        pendingAppointments: pending.length,
        totalTreatments: treatments.length,
        upcomingAppointments: upcoming.length,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Không thể tải thống kê bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  const statCards = useMemo(() => [
    { label: "Lịch hẹn hôm nay", value: stats.todayAppointments, color: '#3498db', icon: '📅' },
    { label: 'Lịch hẹn đang chờ', value: stats.pendingAppointments, color: '#f39c12', icon: '⏳' },
    { label: 'Tổng điều trị', value: stats.totalTreatments, color: '#2ecc71', icon: '💊' },
    { label: 'Lịch hẹn sắp tới', value: stats.upcomingAppointments, color: '#9b59b6', icon: '📋' },
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
        <h1 className="dashboard-title">
          Bảng Điều Khiển Bác Sĩ
        </h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="stats-grid">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        <div className="quick-actions-card">
          <h2 className="quick-actions-title">
            Thao Tác Nhanh
          </h2>
          <div className="actions-container">
            <ActionButton to="/doctor/appointments" color="#3498db">
              Xem Lịch Hẹn
            </ActionButton>
            <ActionButton to="/doctor/treatments" color="#2ecc71">
              Quản Lý Điều Trị
            </ActionButton>
            <ActionButton to="/doctor/patients" color="#9b59b6">
              Tìm Bệnh Nhân
            </ActionButton>
            <ActionButton to="/doctor/profile" color="#f39c12">
              Edit Profile
            </ActionButton>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;

