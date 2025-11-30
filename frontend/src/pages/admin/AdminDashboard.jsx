import { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import StatCard from '../../components/common/StatCard';
import ActionButton from '../../components/common/ActionButton';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    pendingFeedbacks: 0,
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

      setStats({
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        pendingFeedbacks: feedbacks.length,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = useMemo(() => [
    { label: 'Total Doctors', value: stats.totalDoctors, color: '#3498db', icon: '👨‍⚕️' },
    { label: 'Total Patients', value: stats.totalPatients, color: '#2ecc71', icon: '👥' },
    { label: 'Total Appointments', value: stats.totalAppointments, color: '#f39c12', icon: '📅' },
    { label: 'Pending Feedbacks', value: stats.pendingFeedbacks, color: '#e74c3c', icon: '💬' },
  ], [stats]);

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <h1 className="dashboard-title">
          Admin Dashboard
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
            Quick Actions
          </h2>
          <div className="actions-container">
            <ActionButton to="/admin/doctors" color="#3498db">
              Manage Doctors
            </ActionButton>
            <ActionButton to="/admin/patients" color="#2ecc71">
              View Patients
            </ActionButton>
            <ActionButton to="/admin/appointments" color="#f39c12">
              View Appointments
            </ActionButton>
            <ActionButton to="/admin/feedbacks" color="#e74c3c">
              View Feedbacks
            </ActionButton>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

