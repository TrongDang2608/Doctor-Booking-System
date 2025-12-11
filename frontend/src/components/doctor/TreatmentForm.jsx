import { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import ErrorMessage from '../common/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';

const TreatmentForm = ({ treatment, appointment, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    appointmentId: null,
    patientId: null,
    diagnosis: '',
    prescription: '',
    treatmentNotes: '',
    followUpDate: '',
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
    if (treatment) {
      // Edit existing treatment
      setFormData({
        appointmentId: treatment.appointmentId || null,
        patientId: treatment.patientId,
        diagnosis: treatment.diagnosis || '',
        prescription: treatment.prescription || '',
        treatmentNotes: treatment.treatmentNotes || '',
        followUpDate: treatment.followUpDate || '',
      });
    } else if (appointment) {
      // Create treatment from appointment
      setFormData({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        diagnosis: '',
        prescription: '',
        treatmentNotes: '',
        followUpDate: '',
      });
    }
  }, [treatment, appointment]);

  const loadPatients = async () => {
    try {
      const data = await doctorService.searchPatients('');
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients:', err);
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
    setLoading(true);

    try {
      if (treatment) {
        await doctorService.updateTreatment(treatment.id, formData);
      } else {
        if (!formData.patientId) {
          setError('Vui lòng chọn bệnh nhân');
          setLoading(false);
          return;
        }
        const treatmentData = {
          ...formData,
          patientId: parseInt(formData.patientId),
          appointmentId: formData.appointmentId ? parseInt(formData.appointmentId) : null,
        };
        await doctorService.createTreatment(treatmentData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu thông tin điều trị');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
        padding: '20px',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '650px',
          maxHeight: '75vh',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1a1a1a', fontWeight: '600' }}>{treatment ? 'Chỉnh Sửa Điều Trị' : 'Thêm Điều Trị Mới'}</h2>
            <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
            >
              ×
            </button>
          </div>

          <ErrorMessage message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit}>
            {appointment && (
                <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px', color: '#1a1a1a' }}>
                  <div><strong>Bệnh nhân:</strong> {appointment.patientName}</div>
                  <div><strong>Ngày:</strong> {formatDate(appointment.appointmentDate)}</div>
                  <div><strong>Giờ:</strong> {formatTime(appointment.appointmentTime)}</div>
                </div>
            )}

            {!treatment && !appointment && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1a1a1a' }}>
                    Bệnh nhân *
                  </label>
                  <select
                      name="patientId"
                      value={formData.patientId || ''}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', color: '#1a1a1a' }}
                  >
                    <option value="">Chọn bệnh nhân</option>
                    {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.fullName} ({patient.email})
                        </option>
                    ))}
                  </select>
                </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1a1a1a' }}>
                Chẩn đoán
              </label>
              <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Nhập chẩn đoán..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit', color: '#1a1a1a' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1a1a1a' }}>
                Đơn thuốc
              </label>
              <textarea
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Nhập đơn thuốc..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit', color: '#1a1a1a' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1a1a1a' }}>
                Ghi chú điều trị
              </label>
              <textarea
                  name="treatmentNotes"
                  value={formData.treatmentNotes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Nhập ghi chú điều trị..."
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit', color: '#1a1a1a' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1a1a1a' }}>
                Ngày tái khám
              </label>
              <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', color: '#1a1a1a' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.75rem 1.5rem',
                    height: '49.6px',
                    background: 'white',
                    border: '1px solid #333',
                    color: '#333',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
              >
                Hủy
              </button>
              <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    height: '49.6px',
                    margin: 0,
                    background: loading ? 'rgba(16, 185, 129, 0.5)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: '1px solid transparent',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
              >
                {loading ? 'Đang lưu...' : treatment ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default TreatmentForm;