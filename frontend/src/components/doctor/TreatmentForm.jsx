import { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import ErrorMessage from '../common/ErrorMessage';
import MedicationSearch from './MedicationSearch';
import PrescriptionTemplate from './PrescriptionTemplate';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import './TreatmentForm.css';

const TreatmentForm = ({ treatment, appointment, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    appointmentId: null,
    patientId: null,
    diagnosis: '',
    diagnosisCode: '',
    prescription: '',
    treatmentNotes: '',
    followUpDate: '',
    advice: '',
    pharmacyInstructions: ''
  });
  const [medications, setMedications] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPrescriptionPreview, setShowPrescriptionPreview] = useState(false);

  useEffect(() => {
    loadPatients();
    loadDoctorInfo();
    if (treatment) {
      // Edit existing treatment
      setFormData({
        appointmentId: treatment.appointmentId || null,
        patientId: treatment.patientId,
        diagnosis: treatment.diagnosis || '',
        diagnosisCode: treatment.diagnosisCode || '',
        prescription: treatment.prescription || '',
        treatmentNotes: treatment.treatmentNotes || '',
        followUpDate: treatment.followUpDate || '',
        advice: treatment.advice || '',
        pharmacyInstructions: treatment.pharmacyInstructions || ''
      });
      if (treatment.medications) {
        // Map medications to ensure both name and medicationName are set
        // Parse commonDosages and commonFrequencies if they exist (from medication selection)
        const mappedMeds = treatment.medications.map(med => {
          let commonDosages = [];
          let commonFrequencies = [];
          
          // Parse if they exist (when medication was selected from search)
          if (med.commonDosages) {
            try {
              if (typeof med.commonDosages === 'string') {
                commonDosages = JSON.parse(med.commonDosages || '[]');
              } else if (Array.isArray(med.commonDosages)) {
                commonDosages = med.commonDosages;
              }
            } catch (e) {
              commonDosages = [];
            }
          }
          
          if (med.commonFrequencies) {
            try {
              if (typeof med.commonFrequencies === 'string') {
                commonFrequencies = JSON.parse(med.commonFrequencies || '[]');
              } else if (Array.isArray(med.commonFrequencies)) {
                commonFrequencies = med.commonFrequencies;
              }
            } catch (e) {
              commonFrequencies = [];
            }
          }
          
          return {
            ...med,
            name: med.medicationName || med.name,
            medicationName: med.medicationName || med.name,
            commonDosages: commonDosages,
            commonFrequencies: commonFrequencies
          };
        });
        setMedications(mappedMeds);
      }
    } else if (appointment) {
      // Create treatment from appointment
      setFormData({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        diagnosis: '',
        diagnosisCode: '',
        prescription: '',
        treatmentNotes: '',
        followUpDate: '',
        advice: '',
        pharmacyInstructions: ''
      });
      loadPatientInfo(appointment.patientId);
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

  const loadPatientInfo = async (patientId) => {
    try {
      const data = await doctorService.getPatientById(patientId);
      setPatientInfo(data);
    } catch (err) {
      console.error('Failed to load patient info:', err);
    }
  };

  const loadDoctorInfo = async () => {
    try {
      const data = await doctorService.getProfile();
      setDoctorInfo(data);
    } catch (err) {
      console.error('Failed to load doctor info:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddMedication = (medication) => {
    setMedications([...medications, medication]);
  };

  const handleRemoveMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index, field, value) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedMeds = medications.map((m, idx) => ({
      medicationId: m.medicationId || m.id || null,
      medicationName: m.medicationName || m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      quantity: m.quantity,
      unit: m.unit,
      instructions: m.instructions,
      price: m.price,
      orderIndex: m.orderIndex ?? idx,
    }));

    try {
      if (treatment) {
        await doctorService.updateTreatment(treatment.id, {
          ...formData,
          medications: normalizedMeds
        });
      } else {
        if (!formData.patientId) {
          setError('Vui lòng chọn bệnh nhân');
          setLoading(false);
          return;
        }
        const treatmentData = {
          ...formData,
          medications: normalizedMeds,
          patientId: parseInt(formData.patientId),
          appointmentId: formData.appointmentId ? parseInt(formData.appointmentId) : null,
        };
        await doctorService.createTreatment(treatmentData);
        
        // TODO: Send email with prescription template
        // This will be implemented when backend is ready
        console.log('📧 Would send prescription email to:', patientInfo?.email);
        console.log('📄 Prescription data:', {
          patient: patientInfo,
          doctor: doctorInfo,
          prescription: {
            ...formData,
            medications,
            date: new Date().toISOString(),
            prescriptionNumber: `BN${Date.now()}`
          }
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu thông tin điều trị');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="treatment-form-overlay">
      <div className="treatment-form-container">
        <div className="treatment-form-header">
          <h2>{treatment ? 'Chỉnh Sửa Điều Trị' : 'Thêm Điều Trị Mới'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} className="treatment-form">
          {appointment && (
            <div className="appointment-info-card">
              <div><strong>Bệnh nhân:</strong> {appointment.patientName}</div>
              <div><strong>Ngày:</strong> {formatDate(appointment.appointmentDate)}</div>
              <div><strong>Giờ:</strong> {formatTime(appointment.appointmentTime)}</div>
            </div>
          )}

          {!treatment && !appointment && (
            <div className="form-group">
              <label>
                Bệnh nhân <span className="required">*</span>
              </label>
              <select
                name="patientId"
                value={formData.patientId || ''}
                onChange={handleChange}
                required
                className="form-input"
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

          {/* Diagnosis */}
          <div className="form-section">
            <h3 className="section-title">Chẩn đoán</h3>
            <div className="form-group">
              <label>Mã chẩn đoán</label>
              <input
                type="text"
                name="diagnosisCode"
                value={formData.diagnosisCode}
                onChange={handleChange}
                placeholder="VD: J02"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Chẩn đoán</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                rows="3"
                placeholder="Nhập chẩn đoán..."
                className="form-textarea"
              />
            </div>
          </div>

          {/* Medication Prescription */}
          <div className="form-section prescription-section">
            <h3 className="section-title">Kê đơn thuốc</h3>
            
            <MedicationSearch 
              onSelectMedication={handleAddMedication}
              selectedMedications={medications}
            />

            {medications.length > 0 && (
              <div className="medications-list">
                {medications.map((med, index) => (
                  <div key={index} className="medication-card">
                    <div className="medication-header">
                      <span className="med-number">{index + 1}/</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(index)}
                        className="remove-med-button"
                      >
                        ×
                      </button>
                    </div>
                    <div className="medication-fields">
                      <div className="form-group">
                        <label>Tên thuốc <span className="required">*</span></label>
                        <input
                          type="text"
                          value={med.medicationName || med.name || ''}
                          onChange={(e) => {
                            handleMedicationChange(index, 'medicationName', e.target.value);
                            handleMedicationChange(index, 'name', e.target.value);
                          }}
                          placeholder="VD: Panadol 500mg"
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Liều dùng <span className="required">*</span></label>
                        <div className="selectable-input-group">
                          {med.commonDosages && Array.isArray(med.commonDosages) && med.commonDosages.length > 0 && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleMedicationChange(index, 'dosage', e.target.value);
                                }
                              }}
                              className="form-select"
                            >
                              <option value="">Chọn liều dùng...</option>
                              {med.commonDosages.map((dose, idx) => (
                                <option key={idx} value={dose}>
                                  {dose}
                                </option>
                              ))}
                            </select>
                          )}
                          <input
                            type="text"
                            value={med.dosage || ''}
                            onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            placeholder="VD: 500mg hoặc sáng 1 gói - chiều 1 gói"
                            className="form-input"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Tần suất</label>
                        <div className="selectable-input-group">
                          {med.commonFrequencies && Array.isArray(med.commonFrequencies) && med.commonFrequencies.length > 0 && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleMedicationChange(index, 'frequency', e.target.value);
                                }
                              }}
                              className="form-select"
                            >
                              <option value="">Chọn tần suất...</option>
                              {med.commonFrequencies.map((freq, idx) => (
                                <option key={idx} value={freq}>
                                  {freq}
                                </option>
                              ))}
                            </select>
                          )}
                          <input
                            type="text"
                            value={med.frequency || ''}
                            onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            placeholder="VD: 2 lần/ngày"
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Số lượng</label>
                        <div className="quantity-input-group">
                          <input
                            type="number"
                            value={med.quantity}
                            onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="form-input"
                            min="0"
                          />
                          <select
                            value={med.unit || 'viên'}
                            onChange={(e) => handleMedicationChange(index, 'unit', e.target.value)}
                            className="form-input unit-select"
                          >
                            <option value="viên">Viên</option>
                            <option value="gói">Gói</option>
                            <option value="chai">Chai</option>
                            <option value="tuýp">Tuýp</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Treatment Notes */}
          <div className="form-section">
            <h3 className="section-title">Ghi chú điều trị</h3>
            <div className="form-group">
              <textarea
                name="treatmentNotes"
                value={formData.treatmentNotes}
                onChange={handleChange}
                rows="4"
                placeholder="Nhập ghi chú điều trị..."
                className="form-textarea"
              />
            </div>
          </div>

          {/* Follow-up and Advice */}
          <div className="form-section">
            <div className="form-group">
              <label>Ngày tái khám</label>
              <input
                type="date"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Lời dặn</label>
              <textarea
                name="advice"
                value={formData.advice}
                onChange={handleChange}
                rows="2"
                placeholder="VD: Ăn nóng uống sôi"
                className="form-textarea"
              />
            </div>
          </div>

          {/* Prescription Preview Toggle */}
          {medications.length > 0 && (
            <div className="form-section">
              <button
                type="button"
                onClick={() => setShowPrescriptionPreview(!showPrescriptionPreview)}
                className="preview-toggle-button"
              >
                {showPrescriptionPreview ? 'Ẩn' : 'Xem'} mẫu đơn thuốc
              </button>
            </div>
          )}

          {/* Prescription Preview */}
          {showPrescriptionPreview && medications.length > 0 && (
            <div className="prescription-preview-section">
              <PrescriptionTemplate
                prescriptionData={{
                  ...formData,
                  medications,
                  date: new Date().toISOString(),
                  prescriptionNumber: `BN${Date.now()}`
                }}
                patientData={patientInfo || appointment}
                doctorData={doctorInfo}
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="button-cancel"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="button-submit"
            >
              {loading ? 'Đang lưu...' : 'Lưu & Gửi E-Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TreatmentForm;
