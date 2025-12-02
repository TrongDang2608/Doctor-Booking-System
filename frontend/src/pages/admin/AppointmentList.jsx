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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>

        <ErrorMessage message={error} onClose={() => setError('')} />

        {/* Filter Section */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="font-semibold text-gray-700">Filter by Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Data Table */}
        <DataTable
          columns={[
            {
              header: 'Patient',
              accessor: 'patientName',
              render: (appointment) => (
                <div>
                  <div className="font-semibold text-gray-900">{appointment.patientName}</div>
                  <div className="text-xs text-gray-500 mt-1">{appointment.patientPhone}</div>
                </div>
              )
            },
            {
              header: 'Doctor',
              accessor: 'doctorName',
              render: (appointment) => (
                <div>
                  <div className="font-semibold text-gray-900">{appointment.doctorName}</div>
                  <div className="text-xs text-gray-500 mt-1">{appointment.doctorSpecialization}</div>
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
                const statusStyles = {
                  PENDING: 'bg-yellow-100 text-yellow-800',
                  CONFIRMED: 'bg-blue-100 text-blue-800',
                  COMPLETED: 'bg-green-100 text-green-800',
                  CANCELLED: 'bg-red-100 text-red-800',
                };
                const className = statusStyles[appointment.status] || 'bg-gray-100 text-gray-800';
                return (
                  <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${className}`}>
                    {appointment.status}
                  </span>
                );
              }
            },
            {
              header: 'Notes',
              accessor: 'notes',
              render: (appointment) => (
                <div className="max-w-[200px] text-sm truncate">
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

