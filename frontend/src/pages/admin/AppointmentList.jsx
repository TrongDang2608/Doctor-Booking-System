import { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/common/DataTable';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import './adminPages.css';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [filterDate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAppointments(filterDate || null);
      setAppointments(data);
      setError('');
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = useMemo(() => (status) => {
    switch (status) {
      case 'PENDING':
        return '#f39c12';
      case 'CONFIRMED':
        return '#3498db';
      case 'COMPLETED':
        return '#2ecc71';
      case 'CANCELLED':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  }, []);

  if (loading && appointments.length === 0) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="page-title">
          Appointment Management
        </h1>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <div className="filter-container">
          <label className="filter-label">Filter by Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-input"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="clear-filter-btn"
            >
              Clear Filter
            </button>
          )}
        </div>

        <DataTable
          columns={[
            {
              header: 'Patient',
              accessor: 'patientName',
              render: (appointment) => (
                <div>
                  <div style={{ fontWeight: '600', color: '#e0e0e0' }}>{appointment.patientName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                    {appointment.patientPhone}
                  </div>
                </div>
              )
            },
            {
              header: 'Doctor',
              accessor: 'doctorName',
              render: (appointment) => (
                <div>
                  <div style={{ fontWeight: '600', color: '#e0e0e0' }}>{appointment.doctorName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                    {appointment.doctorSpecialization}
                  </div>
                </div>
              )
            },
            {
              header: 'Date',
              accessor: 'appointmentDate',
              render: (appointment) => formatDate(appointment.appointmentDate)
            },
            {
              header: 'Time',
              accessor: 'appointmentTime',
              render: (appointment) => formatTime(appointment.appointmentTime)
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (appointment) => {
                const color = getStatusColor(appointment.status);
                return (
                  <span className="status-badge" style={{
                    backgroundColor: color + '20',
                    color: color,
                  }}>
                    {appointment.status}
                  </span>
                );
              }
            },
            {
              header: 'Notes',
              accessor: 'notes',
              render: (appointment) => (
                <div style={{ maxWidth: '200px', fontSize: '0.9rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {appointment.notes || '-'}
                </div>
              )
            }
          ]}
          data={appointments}
          loading={loading && appointments.length === 0}
          emptyMessage={filterDate ? `No appointments found for ${formatDate(filterDate)}` : 'No appointments found'}
        />
      </div>
    </AdminLayout>
  );
};

export default AppointmentList;

