import { useEffect, useState } from 'react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { doctorService } from '../../services/doctorService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import './DoctorProfile.css';

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName,
        specialization: data.specialization,
        qualification: data.qualification || '',
        experience: data.experience || 0,
        phone: data.phone || '',
        address: data.address || '',
        bio: data.bio || '',
      });
      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'experience' ? parseInt(value) || 0 : value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const updated = await doctorService.updateProfile(formData);
      setProfile(updated);
      setEditMode(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await doctorService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <Loading />
      </DoctorLayout>
    );
  }

  if (!profile) {
    return (
      <DoctorLayout>
        <div>Profile not found</div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="doctor-profile">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="edit-btn"
            >
              Edit Profile
            </button>
          )}
        </div>

        <ErrorMessage message={error} onClose={() => setError('')} />
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="profile-grid">
          {/* Profile Information */}
          <div className="profile-card">
            <h2 className="card-title">Profile Information</h2>
            {!editMode ? (
              <div className="profile-info">
                <div className="info-item">
                  <strong>Full Name:</strong> {profile.fullName}
                </div>
                <div className="info-item">
                  <strong>Specialization:</strong> {profile.specialization}
                </div>
                <div className="info-item">
                  <strong>Qualification:</strong> {profile.qualification || '-'}
                </div>
                <div className="info-item">
                  <strong>Experience:</strong> {profile.experience} years
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {profile.email}
                </div>
                <div className="info-item">
                  <strong>Phone:</strong> {profile.phone || '-'}
                </div>
                <div className="info-item">
                  <strong>Address:</strong> {profile.address || '-'}
                </div>
                {profile.bio && (
                  <div className="info-item">
                    <strong>Bio:</strong>
                    <p>{profile.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div>
                  <label className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="form-textarea"
                  />
                </div>
                <div className="form-buttons">
                  <button
                    type="submit"
                    className="btn-save"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      loadProfile();
                    }}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password */}
          <div className="profile-card">
            <h2 className="card-title">Change Password</h2>
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn-change-password"
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="profile-form">
                <div>
                  <label className="form-label">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={6}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="form-input"
                  />
                </div>
                <div className="form-buttons">
                  <button
                    type="submit"
                    className="btn-save"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;

