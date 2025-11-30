import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit, Lock, AlertTriangle, Heart, Activity, 
  Pill, Calendar, CreditCard, Users, Plus,
  X, Save, Eye
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, Area
} from 'recharts';
import PatientLayout from '../../components/patient/PatientLayout';
import { patientService } from '../../services/patientService';
import { formatDate } from '../../utils/formatDate';
import './PatientProfile.css';

// Mock data for demonstration
const mockVitalStats = {
  bmi: 22.5,
  heartRate: 72,
  weight: 65,
  bloodType: 'O+',
  allergies: ['Penicillin', 'Dust']
};

const mockMedicines = [
  { id: 1, name: 'Paracetamol 500mg', daysRemaining: 5, totalDays: 7, schedule: 'Morning & Evening' },
  { id: 2, name: 'Amoxicillin 250mg', daysRemaining: 2, totalDays: 5, schedule: '3 times daily' },
  { id: 3, name: 'Vitamin D3', daysRemaining: 15, totalDays: 30, schedule: 'Once daily' },
];

const mockTimeline = [
  { id: 1, date: '2024-11-15', doctor: 'Dr. Nguyen Van A', diagnosis: 'Common Cold', prescription: 'Paracetamol, Vitamin C' },
  { id: 2, date: '2024-10-20', doctor: 'Dr. Tran Thi B', diagnosis: 'Hypertension Check', prescription: 'Blood pressure monitoring' },
  { id: 3, date: '2024-09-10', doctor: 'Dr. Le Van C', diagnosis: 'Annual Checkup', prescription: 'General health assessment' },
];

const mockSpendingData = [
  { month: 'Jan', amount: 500000 },
  { month: 'Feb', amount: 750000 },
  { month: 'Mar', amount: 300000 },
  { month: 'Apr', amount: 900000 },
  { month: 'May', amount: 600000 },
  { month: 'Jun', amount: 450000 },
  { month: 'Jul', amount: 800000 },
  { month: 'Aug', amount: 550000 },
  { month: 'Sep', amount: 700000 },
  { month: 'Oct', amount: 650000 },
  { month: 'Nov', amount: 500000 },
  { month: 'Dec', amount: 400000 },
];

const mockFamilyMembers = [
  { id: 1, name: 'Nguyen Van A', relation: 'Son', avatar: 'A' },
  { id: 2, name: 'Nguyen Thi B', relation: 'Daughter', avatar: 'B' },
  { id: 3, name: 'Nguyen Van C', relation: 'Father', avatar: 'C' },
];

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSOSForm, setShowSOSForm] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [sosData, setSosData] = useState({
    emergencyContact: '',
    emergencyPhone: '',
  });
  const [insuranceFlipped, setInsuranceFlipped] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [profileData, treatmentsData] = await Promise.all([
        patientService.getProfile().catch(() => null),
        patientService.getTreatments().catch(() => []),
      ]);
      
      setProfile(profileData);
      setTreatments(treatmentsData);
      
      if (profileData) {
        setFormData({
          fullName: profileData.fullName,
          dateOfBirth: profileData.dateOfBirth || '',
          gender: profileData.gender || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          emergencyContact: profileData.emergencyContact || '',
          emergencyPhone: profileData.emergencyPhone || '',
        });
        
        setSosData({
          emergencyContact: profileData.emergencyContact || '',
          emergencyPhone: profileData.emergencyPhone || '',
        });
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load profile data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const updated = await patientService.updateProfile(formData);
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
      await patientService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleUpdateSOS = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updated = await patientService.updateProfile({
        ...formData,
        emergencyContact: sosData.emergencyContact,
        emergencyPhone: sosData.emergencyPhone,
      });
      setProfile(updated);
      setShowSOSForm(false);
      setSuccess('Emergency contact updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update emergency contact');
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getQRCodeData = () => {
    if (!profile) return '';
    return JSON.stringify({
      patientId: profile.id,
      name: profile.fullName,
      timestamp: Date.now(),
    });
  };

  const profileCompleteness = profile ? 85 : 0; // Calculate based on filled fields

  // BMI Gauge Data
  const bmiData = [
    { name: 'BMI', value: mockVitalStats.bmi },
    { name: 'Remaining', value: 40 - mockVitalStats.bmi }
  ];
  const COLORS = ['#10b981', '#e5e7eb'];

  if (loading) {
    return (
      <PatientLayout>
        <SkeletonLoader />
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="patient-health-dashboard">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-error"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="alert alert-success"
          >
            {success}
          </motion.div>
        )}

        <div className="dashboard-grid">
          {/* LEFT COLUMN: Medical Passport */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="medical-passport"
          >
            <MedicalPassportCard
              profile={profile}
              qrData={getQRCodeData()}
              profileCompleteness={profileCompleteness}
              age={calculateAge(profile?.dateOfBirth)}
              onEditProfile={() => setEditMode(true)}
              onChangePassword={() => setShowPasswordForm(true)}
              onSOS={() => setShowSOSForm(true)}
            />
          </motion.aside>

          {/* RIGHT COLUMN: Bento Grid Dashboard */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bento-dashboard"
          >
            <motion.div
              className="bento-grid"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {/* Block 1: Vital Signs */}
              <VitalSignsBlock vitalStats={mockVitalStats} bmiData={bmiData} COLORS={COLORS} />

              {/* Block 2: Medicine Cabinet */}
              <MedicineCabinetBlock medicines={mockMedicines} />

              {/* Block 3: Medical Timeline */}
              <MedicalTimelineBlock 
                timeline={mockTimeline} 
                onViewDetails={setSelectedTreatment}
              />

              {/* Block 4: Insurance & Wallet */}
              <InsuranceWalletBlock
                insuranceNumber="BH123456789"
                insuranceExpiry="2025-12-31"
                spendingData={mockSpendingData}
                isFlipped={insuranceFlipped}
                onFlip={() => setInsuranceFlipped(!insuranceFlipped)}
              />

              {/* Block 5: Family Connections */}
              <FamilyConnectionsBlock familyMembers={mockFamilyMembers} />
            </motion.div>
          </motion.main>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {editMode && (
            <EditProfileModal
              profile={profile}
              formData={formData}
              onInputChange={handleInputChange}
              onSave={handleUpdateProfile}
              onClose={() => setEditMode(false)}
            />
          )}
          {showPasswordForm && (
            <PasswordModal
              passwordData={passwordData}
              onPasswordChange={setPasswordData}
              onSave={handleChangePassword}
              onClose={() => {
                setShowPasswordForm(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
            />
          )}
          {showSOSForm && (
            <SOSModal
              sosData={sosData}
              onSOSChange={setSosData}
              onSave={handleUpdateSOS}
              onClose={() => setShowSOSForm(false)}
            />
          )}
          {selectedTreatment && (
            <TreatmentDetailModal
              treatment={selectedTreatment}
              onClose={() => setSelectedTreatment(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </PatientLayout>
  );
};

// Medical Passport Card Component
const MedicalPassportCard = ({ profile, qrData, profileCompleteness, age, onEditProfile, onChangePassword, onSOS }) => {
  return (
    <motion.div
      className="passport-card"
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="passport-header">
        <div className="avatar-container">
          <CircularProgressRing progress={profileCompleteness} size={120} strokeWidth={8}>
            <div className="avatar">
              {profile?.fullName?.charAt(0)?.toUpperCase() || 'P'}
            </div>
          </CircularProgressRing>
        </div>
        <div className="passport-info">
          <h2 className="patient-name">{profile?.fullName || 'Patient Name'}</h2>
          <p className="patient-id">ID: {profile?.id || 'N/A'}</p>
          <div className="patient-meta">
            <span>Age: {age}</span>
            <span className="blood-type-tag">{mockVitalStats.bloodType}</span>
          </div>
        </div>
      </div>

      <div className="qr-section">
        <div className="qr-wrapper">
          <QRCodeSVG value={qrData} size={120} level="H" />
        </div>
        <p className="qr-label">Scan to Check-in</p>
      </div>

      <div className="quick-actions">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="action-btn secondary"
          onClick={onEditProfile}
        >
          <Edit size={18} />
          Edit Profile
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="action-btn secondary"
          onClick={onChangePassword}
        >
          <Lock size={18} />
          Change Password
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="action-btn sos"
          onClick={onSOS}
        >
          <AlertTriangle size={18} />
          SOS Emergency
        </motion.button>
      </div>
    </motion.div>
  );
};

// Circular Progress Ring Component
const CircularProgressRing = ({ progress, size, strokeWidth, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring-svg">
        <circle
          className="progress-ring-background"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="progress-ring-foreground"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="progress-ring-content">
        {children}
      </div>
    </div>
  );
};

// Block 1: Vital Signs
const VitalSignsBlock = ({ vitalStats, bmiData, COLORS }) => {
  return (
    <motion.div
      className="bento-block vital-block"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
    >
      <h3 className="block-title">Vital Signs & Stats</h3>
      
      <div className="vital-content">
        <div className="bmi-gauge-container">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={bmiData}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {bmiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <text x="50%" y="50%" textAnchor="middle" className="bmi-text">
                {vitalStats.bmi}
              </text>
              <text x="50%" y="60%" textAnchor="middle" className="bmi-label">
                BMI
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="vital-stats-grid">
          <div className="vital-stat-card">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="heart-icon"
            >
              <Heart size={32} fill="#ef4444" color="#ef4444" />
            </motion.div>
            <div className="stat-value">{vitalStats.heartRate}</div>
            <div className="stat-label">BPM</div>
          </div>

          <div className="vital-stat-card">
            <Activity size={32} color="#10b981" />
            <div className="stat-value">{vitalStats.weight}</div>
            <div className="stat-label">kg</div>
          </div>
        </div>
      </div>

      {vitalStats.allergies && vitalStats.allergies.length > 0 && (
        <div className="allergy-warning">
          <AlertTriangle size={16} />
          <span>{vitalStats.allergies.join(', ')}</span>
        </div>
      )}
    </motion.div>
  );
};

// Block 2: Medicine Cabinet
const MedicineCabinetBlock = ({ medicines }) => {
  return (
    <motion.div
      className="bento-block medicine-block"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
    >
      <h3 className="block-title">Virtual Medicine Cabinet</h3>
      <div className="medicine-list">
        {medicines.map((medicine) => (
          <motion.div
            key={medicine.id}
            className="medicine-card"
            whileHover={{ scale: 1.02, x: 5 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="medicine-header">
              <Pill size={20} color="#10b981" />
              <span className="medicine-name">{medicine.name}</span>
              {medicine.daysRemaining <= 2 && (
                <span className="refill-badge">Refill Needed</span>
              )}
            </div>
            <div className="medicine-progress">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(medicine.daysRemaining / medicine.totalDays) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <span className="progress-text">
                {medicine.daysRemaining} / {medicine.totalDays} days left
              </span>
            </div>
            <div className="medicine-schedule">{medicine.schedule}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Block 3: Medical Timeline
const MedicalTimelineBlock = ({ timeline, onViewDetails }) => {
  return (
    <motion.div
      className="bento-block timeline-block"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
    >
      <h3 className="block-title">Medical Journey Timeline</h3>
      <div className="timeline-container">
        {timeline.map((item, index) => (
          <motion.div
            key={item.id}
            className="timeline-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
          >
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-date">{formatDate(item.date)}</div>
              <div className="timeline-doctor">{item.doctor}</div>
              <div className="timeline-diagnosis">{item.diagnosis}</div>
              <motion.button
                className="timeline-view-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewDetails(item)}
              >
                <Eye size={14} />
                View Prescription
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Block 4: Insurance & Wallet
const InsuranceWalletBlock = ({ insuranceNumber, insuranceExpiry, spendingData, isFlipped, onFlip }) => {
  return (
    <motion.div
      className="bento-block insurance-block"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
    >
      <h3 className="block-title">Insurance & Wallet</h3>
      <div className="insurance-content">
        <div className="flip-card-container" onClick={onFlip}>
          <motion.div
            className="flip-card"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div className="flip-card-front">
              <div className="insurance-card-front">
                <div className="card-chip">
                  <CreditCard size={24} />
                </div>
                <div className="card-number">{insuranceNumber}</div>
                <div className="card-expiry">Exp: {insuranceExpiry}</div>
                <div className="card-label">Health Insurance</div>
              </div>
            </div>

            {/* Back */}
            <div className="flip-card-back">
              <div className="insurance-card-back">
                <div className="card-back-qr">
                  <QRCodeSVG value={insuranceNumber} size={80} level="M" />
                </div>
                <div className="card-back-details">
                  <p>Policy: Premium Plan</p>
                  <p>Coverage: 80%</p>
                  <p>Expires: {insuranceExpiry}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="spending-chart">
          <h4 className="chart-title">Yearly Medical Spending</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={spendingData}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: '#aaa' }} 
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#aaa' }} 
                stroke="#666"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 15, 15, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#e0e0e0'
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

// Block 5: Family Connections
const FamilyConnectionsBlock = ({ familyMembers }) => {
  return (
    <motion.div
      className="bento-block family-block"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
    >
      <h3 className="block-title">Family Connections</h3>
      <div className="family-avatars">
        {familyMembers.map((member, index) => (
          <motion.div
            key={member.id}
            className="family-avatar"
            style={{ marginLeft: index > 0 ? '-20px' : '0' }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
          >
            <div className="avatar-circle">{member.avatar}</div>
            <div className="avatar-tooltip">
              <div className="tooltip-name">{member.name}</div>
              <div className="tooltip-relation">{member.relation}</div>
            </div>
          </motion.div>
        ))}
        <motion.button
          className="family-add-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Skeleton Loader
const SkeletonLoader = () => {
  return (
    <div className="skeleton-container">
      <div className="skeleton-passport"></div>
      <div className="skeleton-grid">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-block"></div>
        ))}
      </div>
    </div>
  );
};

// Modal Components
const EditProfileModal = ({ profile, formData, onInputChange, onSave, onClose }) => {
  return (
    <ModalOverlay onClose={onClose}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSave} className="modal-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ''}
              onChange={onInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth || ''}
              onChange={onInputChange}
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender || ''} onChange={onInputChange}>
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={onInputChange}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={onInputChange}
            />
          </div>
          <div className="modal-actions">
            <motion.button
              type="submit"
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={18} />
              Save Changes
            </motion.button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </ModalOverlay>
  );
};

const PasswordModal = ({ passwordData, onPasswordChange, onSave, onClose }) => {
  return (
    <ModalOverlay onClose={onClose}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSave} className="modal-form">
          <div className="form-group">
            <label>Current Password *</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => onPasswordChange({ ...passwordData, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password *</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => onPasswordChange({ ...passwordData, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password *</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => onPasswordChange({ ...passwordData, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="modal-actions">
            <motion.button
              type="submit"
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={18} />
              Update Password
            </motion.button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </ModalOverlay>
  );
};

const SOSModal = ({ sosData, onSOSChange, onSave, onClose }) => {
  return (
    <ModalOverlay onClose={onClose}>
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="modal-header">
          <h2>SOS Emergency Contact</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSave} className="modal-form">
          <div className="form-group">
            <label>Emergency Contact Name *</label>
            <input
              type="text"
              value={sosData.emergencyContact}
              onChange={(e) => onSOSChange({ ...sosData, emergencyContact: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Emergency Phone *</label>
            <input
              type="tel"
              value={sosData.emergencyPhone}
              onChange={(e) => onSOSChange({ ...sosData, emergencyPhone: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <motion.button
              type="submit"
              className="btn-danger"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={18} />
              Save Emergency Contact
            </motion.button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </ModalOverlay>
  );
};

const TreatmentDetailModal = ({ treatment, onClose }) => {
  return (
    <ModalOverlay onClose={onClose}>
      <motion.div
        className="modal-content large"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="modal-header">
          <h2>Treatment Details</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="treatment-details">
          <div className="detail-item">
            <strong>Doctor:</strong> {treatment.doctor || 'N/A'}
          </div>
          <div className="detail-item">
            <strong>Date:</strong> {formatDate(treatment.date)}
          </div>
          <div className="detail-item">
            <strong>Diagnosis:</strong>
            <p>{treatment.diagnosis}</p>
          </div>
          <div className="detail-item">
            <strong>Prescription:</strong>
            <p>{treatment.prescription}</p>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </motion.div>
    </ModalOverlay>
  );
};

const ModalOverlay = ({ children, onClose }) => {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PatientProfile;
