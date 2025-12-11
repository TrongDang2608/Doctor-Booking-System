import { useEffect, useState, useMemo } from 'react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { doctorService } from '../../services/doctorService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import TreatmentForm from '../../components/doctor/TreatmentForm';
import CancelAppointmentModal from '../../components/doctor/CancelAppointmentModal';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DoctorAppointments.css';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, [filterDate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading doctor appointments...', { filterDate });
      const data = await doctorService.getAppointments(filterDate || null);
      console.log('✅ Appointments loaded:', data);
      setAppointments(data);
      setError('');
    } catch (err) {
      console.error('❌ Error loading appointments:', err);
      console.error('Error response:', err.response?.data);
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId) => {
    try {
      setProcessingId(appointmentId);
      await doctorService.confirmAppointment(appointmentId);
      await loadAppointments();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm appointment');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateTreatment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowTreatmentForm(true);
  };

  const handleTreatmentSuccess = () => {
    setShowTreatmentForm(false);
    setSelectedAppointment(null);
    loadAppointments();
  };

  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async (cancellationReason) => {
    try {
      await doctorService.cancelAppointment(appointmentToCancel.id, cancellationReason);
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      setError('');
      toast.success('Đã hủy lịch hẹn thành công!', {
        position: "top-right",
        autoClose: 2000
      });
      // Delay reload để toast kịp hiển thị
      setTimeout(() => {
        loadAppointments();
      }, 300);
    } catch (err) {
      // Let the modal handle the error display
      throw err;
    }
  };

  const getStatusColor = (status) => {
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
  };

  if (loading && appointments.length === 0) {
    return (
        <DoctorLayout>
          <Loading />
        </DoctorLayout>
    );
  }

  return (
      <DoctorLayout>
        <div className="doctor-appointments">
          <h1 className="page-title">My Appointments</h1>

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

          {appointments.length === 0 ? (
              <div className="empty-state">
                <p>No appointments found</p>
              </div>
          ) : (
              <div className="appointments-table-container">
                <table className="appointments-table">
                  <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>
                          <div className="patient-info">
                            <div className="patient-name">{appointment.patientName}</div>
                            <div className="patient-phone">{appointment.patientPhone}</div>
                          </div>
                        </td>
                        <td>{formatDate(appointment.appointmentDate)}</td>
                        <td>{formatTime(appointment.appointmentTime)}</td>
                        <td>
                      <span className="status-badge" style={{
                        backgroundColor: getStatusColor(appointment.status) + '20',
                        color: getStatusColor(appointment.status),
                      }}>
                        {appointment.status}
                      </span>
                        </td>
                        <td className="notes-cell">
                          {appointment.notes || '-'}
                        </td>
                        <td className="actions-cell">
                          <div className="actions-buttons">
                            {appointment.status === 'PENDING' && (
                                <>
                                  <button
                                      onClick={() => handleConfirm(appointment.id)}
                                      disabled={processingId === appointment.id}
                                      className="action-btn confirm-btn"
                                  >
                                    {processingId === appointment.id ? 'Confirming...' : 'Confirm'}
                                  </button>
                                  <button
                                      onClick={() => handleCancelClick(appointment)}
                                      className="action-btn cancel-btn"
                                      style={{ marginLeft: '8px' }}
                                  >
                                    Hủy lịch
                                  </button>
                                </>
                            )}
                            {appointment.status === 'CONFIRMED' && (
                                <>
                                  <button
                                      onClick={() => handleCreateTreatment(appointment)}
                                      className="action-btn treatment-btn"
                                  >
                                    Create Treatment
                                  </button>
                                  <button
                                      onClick={() => handleCancelClick(appointment)}
                                      className="action-btn cancel-btn"
                                      style={{ marginLeft: '8px' }}
                                  >
                                    Hủy lịch
                                  </button>
                                </>
                            )}
                            {appointment.status === 'COMPLETED' && (
                                <span className="completed-text">Completed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}

          {showTreatmentForm && (
              <TreatmentForm
                  treatment={null}
                  appointment={selectedAppointment}
                  onClose={() => {
                    setShowTreatmentForm(false);
                    setSelectedAppointment(null);
                  }}
                  onSuccess={handleTreatmentSuccess}
              />
          )}

          {showCancelModal && appointmentToCancel && (
              <CancelAppointmentModal
                  appointment={appointmentToCancel}
                  onClose={() => {
                    setShowCancelModal(false);
                    setAppointmentToCancel(null);
                  }}
                  onConfirm={handleConfirmCancel}
              />
          )}
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </DoctorLayout>
  );
};

export default DoctorAppointments;