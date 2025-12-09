import { useState, useEffect } from 'react';
import { familyAccountData, relationshipTypes, familyMemberTemplates } from '../../mockData/patient/familyAccounts';
import './FamilyAccount.css';

const FamilyAccount = () => {
  useEffect(() => {
    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }
  }, []);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    relationship: 'child'
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    // In real app, this would call an API
    console.log('Adding new member:', newMember);
    setShowAddForm(false);
    setNewMember({ fullName: '', dateOfBirth: '', gender: '', relationship: 'child' });
  };

  return (
    <div className="family-account">
      <div className="family-header">
        <div>
          <h2>Quản lý Hồ sơ Gia đình</h2>
          <p>Quản lý hồ sơ sức khỏe cho bạn và người thân</p>
        </div>
        <button 
          className="add-member-btn"
          onClick={() => setShowAddForm(true)}
        >
          <i data-feather="plus"></i> Thêm thành viên
        </button>
      </div>

      {/* Family Members Grid */}
      <div className="family-members-grid">
        {familyAccountData.familyMembers.map((member) => (
          <div
            key={member.id}
            className={`family-member-card ${selectedMember?.id === member.id ? 'selected' : ''}`}
            onClick={() => setSelectedMember(member)}
          >
            <div className="member-avatar">
              {member.avatar ? (
                <img src={member.avatar} alt={member.fullName} />
              ) : (
                <span>{member.fullName.charAt(0)}</span>
              )}
            </div>
            <div className="member-info">
              <h3>{member.fullName}</h3>
              <p className="member-relationship">
                {relationshipTypes.find(r => r.value === member.relationship)?.label || member.relationship}
              </p>
              <p className="member-age">
                {new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear()} tuổi
              </p>
              {member.isMainAccount && (
                <span className="main-badge">Tài khoản chính</span>
              )}
            </div>
            {member.medicalHistory && member.medicalHistory.length > 0 && (
              <div className="member-stats">
                <span>{member.medicalHistory.length} lần khám</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Member Details */}
      {selectedMember && (
        <div className="member-details">
          <div className="details-header">
            <h3>Hồ sơ: {selectedMember.fullName}</h3>
            <button 
              className="close-btn"
              onClick={() => setSelectedMember(null)}
            >
              <i data-feather="x"></i>
            </button>
          </div>

          <div className="details-content">
            <div className="detail-section">
              <h4>Thông tin cá nhân</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Họ tên:</span>
                  <span className="detail-value">{selectedMember.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Ngày sinh:</span>
                  <span className="detail-value">
                    {new Date(selectedMember.dateOfBirth).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Giới tính:</span>
                  <span className="detail-value">
                    {selectedMember.gender === 'male' ? 'Nam' : 'Nữ'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Quan hệ:</span>
                  <span className="detail-value">
                    {relationshipTypes.find(r => r.value === selectedMember.relationship)?.label}
                  </span>
                </div>
              </div>
            </div>

            {selectedMember.allergies && selectedMember.allergies.length > 0 && (
              <div className="detail-section">
                <h4>Dị ứng</h4>
                <div className="allergies-list">
                  {selectedMember.allergies.map((allergy, idx) => (
                    <span key={idx} className="allergy-tag">{allergy}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedMember.chronicConditions && selectedMember.chronicConditions.length > 0 && (
              <div className="detail-section">
                <h4>Bệnh mãn tính</h4>
                <div className="conditions-list">
                  {selectedMember.chronicConditions.map((condition, idx) => (
                    <span key={idx} className="condition-tag">{condition}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedMember.medicalHistory && selectedMember.medicalHistory.length > 0 && (
              <div className="detail-section">
                <h4>Lịch sử khám bệnh</h4>
                <div className="medical-history">
                  {selectedMember.medicalHistory.map((record, idx) => (
                    <div key={idx} className="history-item">
                      <div className="history-date">
                        {new Date(record.date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="history-content">
                        <h5>{record.doctor}</h5>
                        <p>{record.specialty}</p>
                        <p className="history-diagnosis">Chẩn đoán: {record.diagnosis}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-actions">
              <button className="action-btn primary">Đặt lịch khám</button>
              <button className="action-btn secondary">Xem đơn thuốc</button>
              <button className="action-btn secondary">Chỉnh sửa hồ sơ</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm thành viên mới</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                <i data-feather="x"></i>
              </button>
            </div>
            <form onSubmit={handleAddMember} className="add-member-form">
              <div className="form-group">
                <label>Họ tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Ngày sinh <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  value={newMember.dateOfBirth}
                  onChange={(e) => setNewMember({ ...newMember, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Giới tính <span className="text-red-500">*</span></label>
                <select
                  required
                  value={newMember.gender}
                  onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quan hệ <span className="text-red-500">*</span></label>
                <select
                  required
                  value={newMember.relationship}
                  onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                >
                  {relationshipTypes.filter(r => r.value !== 'self').map((rel) => (
                    <option key={rel.value} value={rel.value}>
                      {rel.icon} {rel.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Thêm thành viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyAccount;

