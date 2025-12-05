import React, { useState } from 'react';
import PatientLayout from '../../components/patient/PatientLayout';
import './FamilyProfilePage.css';
import * as feather from 'feather-icons';

const FamilyProfilePage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  // Dữ liệu tĩnh mẫu
  const [familyMembers] = useState([
    {
      id: 1,
      fullName: 'Đặng Tấn Trọng',
      relationship: 'Bản thân',
      dateOfBirth: '2003-08-26',
      gender: 'Nam',
      medicalHistory: '',
      isMainAccount: true
    },
    {
      id: 2,
      fullName: 'Bé Bi',
      relationship: 'Con cái',
      dateOfBirth: '2020-05-15',
      gender: 'Nam',
      medicalHistory: 'Dị ứng với đậu phộng',
      isMainAccount: false
    },
    {
      id: 3,
      fullName: 'Mẹ Lan',
      relationship: 'Bố/Mẹ',
      dateOfBirth: '1970-03-20',
      gender: 'Nữ',
      medicalHistory: 'Cao huyết áp, Tiểu đường type 2',
      isMainAccount: false
    }
  ]);

  const [formData, setFormData] = useState({
    fullName: '',
    relationship: 'Con cái',
    dateOfBirth: '',
    gender: 'Nam',
    medicalHistory: ''
  });

  React.useEffect(() => {
    try {
      feather.replace();
    } catch (error) {
      console.error('Feather icons error:', error);
    }
  }, [familyMembers, showAddModal]);

  const handleAddMember = () => {
    setEditingMember(null);
    setFormData({
      fullName: '',
      relationship: 'Con cái',
      dateOfBirth: '',
      gender: 'Nam',
      medicalHistory: ''
    });
    setShowAddModal(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      medicalHistory: member.medicalHistory || ''
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingMember(null);
    setFormData({
      fullName: '',
      relationship: 'Con cái',
      dateOfBirth: '',
      gender: 'Nam',
      medicalHistory: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call later
    console.log('Form data:', formData);
    alert(editingMember ? 'Cập nhật thành công!' : 'Thêm thành viên thành công!');
    handleCloseModal();
  };

  const handleDeleteMember = (member) => {
    if (window.confirm(`Bạn có chắc muốn xóa hồ sơ của ${member.fullName}?`)) {
      // TODO: Implement API call later
      console.log('Delete member:', member.id);
      alert('Xóa thành công!');
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getRelationshipIcon = (relationship) => {
    switch (relationship) {
      case 'Bản thân': return '👤';
      case 'Con cái': return '👶';
      case 'Bố/Mẹ': return '👨‍👩';
      case 'Ông/Bà': return '👴👵';
      case 'Anh/Chị/Em': return '👫';
      default: return '👤';
    }
  };

  const getRelationshipColor = (relationship) => {
    switch (relationship) {
      case 'Bản thân': return '#667eea';
      case 'Con cái': return '#48bb78';
      case 'Bố/Mẹ': return '#ed8936';
      case 'Ông/Bà': return '#9f7aea';
      case 'Anh/Chị/Em': return '#4299e1';
      default: return '#718096';
    }
  };

  return (
    <PatientLayout>
      <div className="family-profile-page">
      {/* Header */}
      <div className="family-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">👨‍👩‍👧‍👦</span>
            Hồ sơ Gia đình
          </h1>
          <p className="header-subtitle">
            Quản lý thông tin sức khỏe của các thành viên trong gia đình
          </p>
        </div>
        <button className="btn-add-member" onClick={handleAddMember}>
          <i data-feather="user-plus"></i>
          Thêm thành viên
        </button>
      </div>

      {/* Stats */}
      <div className="family-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i data-feather="users"></i>
          </div>
          <div className="stat-info">
            <div className="stat-label">Thành viên</div>
            <div className="stat-value">{familyMembers.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i data-feather="user-check"></i>
          </div>
          <div className="stat-info">
            <div className="stat-label">Tài khoản chính</div>
            <div className="stat-value">1</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i data-feather="heart"></i>
          </div>
          <div className="stat-info">
            <div className="stat-label">Có tiền sử bệnh</div>
            <div className="stat-value">{familyMembers.filter(m => m.medicalHistory).length}</div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="members-section">
        <div className="section-header">
          <h2>Danh sách thành viên</h2>
          <span className="member-count">{familyMembers.length} người</span>
        </div>

        <div className="members-grid">
          {familyMembers.map(member => (
            <div 
              key={member.id} 
              className={`member-card ${member.isMainAccount ? 'main-account' : ''}`}
            >
              {member.isMainAccount && (
                <div className="main-badge">
                  <i data-feather="star"></i> Tài khoản chính
                </div>
              )}

              <div className="member-header">
                <div className="member-avatar" style={{ 
                  background: `linear-gradient(135deg, ${getRelationshipColor(member.relationship)}33, ${getRelationshipColor(member.relationship)}66)`
                }}>
                  <span className="avatar-icon">{getRelationshipIcon(member.relationship)}</span>
                </div>
                <div className="member-basic-info">
                  <h3 className="member-name">{member.fullName}</h3>
                  <span 
                    className="member-relationship"
                    style={{ color: getRelationshipColor(member.relationship) }}
                  >
                    {member.relationship}
                  </span>
                </div>
              </div>

              <div className="member-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <i data-feather="calendar"></i>
                    <span>{new Date(member.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="detail-item">
                    <i data-feather="gift"></i>
                    <span>{calculateAge(member.dateOfBirth)} tuổi</span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-item">
                    <i data-feather={member.gender === 'Nam' ? 'user' : 'user'}></i>
                    <span>{member.gender}</span>
                  </div>
                </div>
                {member.medicalHistory && (
                  <div className="medical-history">
                    <div className="history-label">
                      <i data-feather="file-text"></i>
                      Tiền sử bệnh:
                    </div>
                    <div className="history-content">{member.medicalHistory}</div>
                  </div>
                )}
              </div>

              <div className="member-actions">
                <button 
                  className="btn-action btn-edit"
                  onClick={() => handleEditMember(member)}
                  disabled={member.isMainAccount}
                >
                  <i data-feather="edit-2"></i>
                  Sửa
                </button>
                <button 
                  className="btn-action btn-delete"
                  onClick={() => handleDeleteMember(member)}
                  disabled={member.isMainAccount}
                >
                  <i data-feather="trash-2"></i>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <i data-feather="x"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="member-form">
              <div className="form-group">
                <label className="form-label">
                  Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Quan hệ <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    required
                  >
                    <option value="Con cái">Con cái</option>
                    <option value="Bố/Mẹ">Bố/Mẹ</option>
                    <option value="Ông/Bà">Ông/Bà</option>
                    <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Giới tính <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Ngày sinh <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tiền sử bệnh</label>
                <textarea
                  className="form-textarea"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder="Nhập tiền sử bệnh (nếu có)..."
                  rows="4"
                />
                <div className="form-hint">
                  Ví dụ: Cao huyết áp, Tiểu đường, Dị ứng thuốc...
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  <i data-feather="check"></i>
                  {editingMember ? 'Cập nhật' : 'Thêm thành viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </PatientLayout>
  );
};

export default FamilyProfilePage;

