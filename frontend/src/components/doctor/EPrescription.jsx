import { useState, useEffect } from 'react';
import { prescriptionTemplates, prescriptions, medicationDatabase } from '../../mockData/doctor/prescriptions';
import './EPrescription.css';

const EPrescription = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedMedications, setSelectedMedications] = useState([]);

  useEffect(() => {
    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setSelectedMedications(template.medications);
    setShowTemplates(false);
  };

  const handleAddMedication = () => {
    const newMed = {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 0,
      instructions: ''
    };
    setSelectedMedications([...selectedMedications, newMed]);
  };

  const handleRemoveMedication = (index) => {
    setSelectedMedications(selectedMedications.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index, field, value) => {
    const updated = [...selectedMedications];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedMedications(updated);
  };

  const generatePrescription = () => {
    const newPrescription = {
      id: `pres_${Date.now()}`,
      medications: selectedMedications,
      date: new Date().toISOString(),
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PRES_${Date.now()}`,
      status: 'active'
    };
    setCurrentPrescription(newPrescription);
  };

  return (
    <div className="e-prescription">
      <div className="prescription-header">
        <h2>Kê đơn thuốc điện tử</h2>
        <p>Chọn mẫu đơn hoặc tạo đơn mới</p>
      </div>

      {showTemplates && (
        <div className="templates-section">
          <h3>Mẫu đơn thuốc</h3>
          <div className="templates-grid">
            {prescriptionTemplates.map((template) => (
              <div
                key={template.id}
                className="template-card"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="template-header">
                  <h4>{template.name}</h4>
                  <span className="template-specialty">{template.specialty}</span>
                </div>
                <div className="template-symptoms">
                  <strong>Triệu chứng:</strong>
                  <div className="symptoms-tags">
                    {template.commonSymptoms.map((symptom, idx) => (
                      <span key={idx} className="symptom-tag">{symptom}</span>
                    ))}
                  </div>
                </div>
                <div className="template-medications">
                  <strong>{template.medications.length} loại thuốc</strong>
                </div>
                <button className="template-use-btn">Sử dụng mẫu này</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showTemplates && (
        <div className="prescription-form">
          <div className="form-header">
            <button
              className="back-btn"
              onClick={() => {
                setShowTemplates(true);
                setSelectedTemplate(null);
                setSelectedMedications([]);
              }}
            >
              <i data-feather="arrow-left"></i> Quay lại
            </button>
            {selectedTemplate && (
              <h3>Mẫu: {selectedTemplate.name}</h3>
            )}
          </div>

          <div className="medications-list">
            <div className="medications-header">
              <h3>Danh sách thuốc</h3>
              <button className="add-med-btn" onClick={handleAddMedication}>
                <i data-feather="plus"></i> Thêm thuốc
              </button>
            </div>

            {selectedMedications.map((med, index) => (
              <div key={index} className="medication-item">
                <div className="medication-fields">
                  <div className="field-group">
                    <label>Tên thuốc *</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      placeholder="VD: Paracetamol 500mg"
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label>Liều lượng *</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      placeholder="VD: 1 viên"
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label>Tần suất *</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      placeholder="VD: 3 lần/ngày"
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label>Thời gian dùng</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      placeholder="VD: 5 ngày"
                    />
                  </div>
                  <div className="field-group">
                    <label>Số lượng</label>
                    <input
                      type="number"
                      value={med.quantity}
                      onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="field-group full-width">
                    <label>Hướng dẫn sử dụng</label>
                    <textarea
                      value={med.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      placeholder="VD: Uống sau ăn"
                      rows={2}
                    />
                  </div>
                </div>
                <button
                  className="remove-med-btn"
                  onClick={() => handleRemoveMedication(index)}
                >
                  <i data-feather="trash-2"></i>
                </button>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setShowTemplates(true)}>
              Hủy
            </button>
            <button className="btn-primary" onClick={generatePrescription}>
              <i data-feather="check"></i> Tạo đơn thuốc
            </button>
          </div>
        </div>
      )}

      {currentPrescription && (
        <div className="prescription-result">
          <div className="result-header">
            <h3>Đơn thuốc đã tạo</h3>
            <button className="close-btn" onClick={() => setCurrentPrescription(null)}>
              <i data-feather="x"></i>
            </button>
          </div>
          <div className="prescription-content">
            <div className="prescription-info">
              <p><strong>Ngày:</strong> {new Date(currentPrescription.date).toLocaleDateString('vi-VN')}</p>
              <p><strong>Trạng thái:</strong> {currentPrescription.status === 'active' ? 'Hoạt động' : 'Đã hủy'}</p>
            </div>
            <div className="prescription-medications">
              <h4>Danh sách thuốc:</h4>
              {currentPrescription.medications.map((med, idx) => (
                <div key={idx} className="prescription-med-item">
                  <h5>{med.name}</h5>
                  <p>Liều lượng: {med.dosage}</p>
                  <p>Tần suất: {med.frequency}</p>
                  {med.duration && <p>Thời gian: {med.duration}</p>}
                  {med.instructions && <p>Hướng dẫn: {med.instructions}</p>}
                </div>
              ))}
            </div>
            <div className="prescription-qr">
              <h4>Mã QR đơn thuốc:</h4>
              <img src={currentPrescription.qrCode} alt="QR Code" />
              <p className="qr-note">Bệnh nhân có thể quét mã QR này tại nhà thuốc để mua thuốc</p>
            </div>
            <div className="prescription-actions">
              <button className="btn-primary">In đơn thuốc</button>
              <button className="btn-secondary">Gửi cho bệnh nhân</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPrescription;


