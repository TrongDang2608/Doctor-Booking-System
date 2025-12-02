import { useEffect, useState } from 'react';
import PatientLayout from '../../components/patient/PatientLayout';
import { patientService } from '../../services/patientService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useNavigate } from 'react-router-dom';
import '../patient/patientPages.css';

const NewBooking = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });
  const [availableTimeSlots] = useState([
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctors();
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, appointmentDate: today }));
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await patientService.searchDoctors('');
      setDoctors(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách bác sĩ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await patientService.createAppointment({
        doctorId: parseInt(formData.doctorId),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime + ':00',
        notes: formData.notes,
      });
      setSuccess('Đặt lịch hẹn thành công!');
      setTimeout(() => {
        navigate('/patient/history');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lịch hẹn. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
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
      <div className="patient-page">
        <h1>Đặt Lịch Hẹn Mới</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="patient-card">
          <form onSubmit={handleSubmit} className="patient-form">
            <div className="form-group">
              <label>Chọn Bác Sĩ *</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">Chọn bác sĩ...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.fullName} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Ngày Hẹn *</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Giờ Hẹn *</label>
                <select
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn giờ...</option>
                  {availableTimeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Ghi Chú (Tùy chọn)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Thông tin bổ sung hoặc mối quan tâm..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate('/patient/dashboard')}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-success"
              >
                {submitting ? 'Đang đặt lịch...' : 'Đặt Lịch Hẹn'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PatientLayout>
  );
};

export default NewBooking;
