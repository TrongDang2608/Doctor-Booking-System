import './PrescriptionTemplate.css';

const PrescriptionTemplate = ({ prescriptionData, patientData, doctorData, clinicData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} Tháng ${month} Năm ${year}`;
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years} tuổi${months > 0 ? ` ${months} tháng` : ''}`;
    } else {
      return `${months} tháng`;
    }
  };

  const getGenderText = (gender) => {
    if (!gender) return '';
    const genderMap = {
      'MALE': 'Nam',
      'FEMALE': 'Nữ',
      'OTHER': 'Khác'
    };
    return genderMap[gender] || gender;
  };

  // Default clinic data
  const defaultClinicData = {
    name: 'BỆNH VIỆN GIAO THÔNG VẬN TẢI',
    address: '70 Đ. Tô Ký, Tân Chánh Hiệp, Quận 12, Thành phố Hồ Chí Minh',
    phone: '',
    zalo: '',
    facebook: '',
    hours: {
      weekdays: '08h00-17h00',
      weekends: '08h00-12h00'
    }
  };

  const clinic = clinicData || defaultClinicData;
  const patient = patientData || {};
  const doctor = doctorData || {};
  const prescription = prescriptionData || {};

  return (
    <div className="prescription-template">
      <div className="prescription-paper">
        {/* Clinic Header */}
        <div className="prescription-header">
          <div className="clinic-info">
            <div className="clinic-name">{clinic.name}</div>
            <div className="clinic-address">{clinic.address}</div>
            {clinic.phone && (
              <div className="clinic-contact">
                {clinic.zalo && <span>Zalo đặt lịch: {clinic.zalo}</span>}
                {clinic.facebook && <span>Facebook: {clinic.facebook}</span>}
                {clinic.phone && <span>SĐT: {clinic.phone}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Title and Barcode */}
        <div className="prescription-title-section">
          <div className="prescription-title">ĐƠN THUỐC</div>
          <div className="prescription-barcode">
            <div className="barcode-number">{prescription.prescriptionNumber || 'BN00000022'}</div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="patient-info-section">
          <div className="info-row">
            <span className="info-label">Họ tên:</span>
            <span className="info-value">{patient.fullName || 'TRẦN NAM VĂN HOÀNG'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Tuổi:</span>
            <span className="info-value">
              {patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : '3 tuổi 2 tháng'} 
              {patient.gender && ` (${getGenderText(patient.gender)})`}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Địa chỉ:</span>
            <span className="info-value">{patient.address || '52 Nguyễn Xiển, Thủ Đức'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Điện thoại:</span>
            <span className="info-value">{patient.phone || '0909289228'}</span>
          </div>
          
          {/* Diagnosis */}
          <div className="info-row">
            <span className="info-label">Chẩn đoán:</span>
            <span className="info-value diagnosis-code">
              {prescription.diagnosisCode || 'J02'} - {prescription.diagnosis || 'Viêm họng cấp'}
            </span>
          </div>
        </div>

        {/* Treatment Section */}
        <div className="treatment-section">
          <div className="section-title" style={{ color: '#0a0a0a', fontWeight: 800 }}>
            Điều trị:
          </div>
          <div className="medications-list">
            {prescription.medications && prescription.medications.length > 0 ? (
              prescription.medications.map((med, index) => (
                <div key={index} className="medication-item">
                  <div className="med-number">{index + 1}/</div>
                  <div className="med-details">
                    <div className="med-name">{med.name}</div>
                    <div className="med-dosage">
                      <span className="dosage-label">Liều dùng:</span> {med.dosage || med.frequency || 'Chưa chỉ định'}
                    </div>
                    <div className="med-quantity">
                      <span className="quantity-label">Số lượng:</span> {med.quantity || 0} {med.unit || 'Viên'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="medication-item">
                <div className="med-number">1/</div>
                <div className="med-details">
                  <div className="med-name">ACEMUC 100 mg gói</div>
                  <div className="med-dosage">
                    <span className="dosage-label">Liều dùng:</span> sáng 1 gói - chiều 1 gói
                  </div>
                  <div className="med-quantity">
                    <span className="quantity-label">Số lượng:</span> 06 Gói
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Follow-up and Advice */}
        <div className="follow-up-section">
          <div className="info-row">
            <span className="info-label">Ngày tái khám:</span>
            <span className="info-value">{prescription.followUpDate ? formatDateShort(prescription.followUpDate) : ''}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Lời dặn:</span>
            <span className="info-value">{prescription.advice || 'Ăn nóng uống sôi'}</span>
          </div>
        </div>

        {/* Clinic Hours */}
        <div className="clinic-hours">
          <div className="hours-title">Giờ khám bệnh:</div>
          <div className="hours-details">
            <span>Thứ 2 - Thứ 6: {clinic.hours.weekdays}</span>
            <span>Thứ bảy, CN: {clinic.hours.weekends}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="prescription-footer">
          <div className="prescription-date">
            <span className="info-label">Ngày:</span> {formatDate(prescription.date || new Date().toISOString())}
          </div>
          <div className="doctor-signature">
            <div className="info-label">Bác sĩ khám bệnh:</div>
            <div className="doctor-name">{doctor.fullName || doctor.name || 'Bs Chi Đinh'}</div>
          </div>
        </div>

        {/* Note */}
        <div className="prescription-note">
          <span className="note-label">*Lưu ý:</span> Tái khám nhớ mang theo toa, phim, hồ sơ cũ.
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTemplate;

