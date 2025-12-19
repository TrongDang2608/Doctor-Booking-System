import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, Award, Clock, Phone, MapPin, FileText, CheckCircle, XCircle, Calendar, X } from 'lucide-react';
import './DoctorDetail.css';

const DoctorDetail = ({ doctor, onClose }) => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    onClose();
    navigate('/patient/booking', { state: { doctorId: doctor.id } });
  };

  return (
    <div className="doctor-detail-overlay" onClick={onClose}>
      <div className="doctor-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="doctor-detail-header">
          <h2>
            <User />
            Doctor Profile
          </h2>
          <button className="close-button" onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="doctor-detail-body">
          <div className="doctor-info-grid">
            {/* Name */}
            <div className="info-item">
              <div className="info-label">
                <User />
                Full Name
              </div>
              <div className="info-value">Dr. {doctor.fullName}</div>
            </div>

            {/* Specialization */}
            <div className="info-item">
              <div className="info-label">
                <Stethoscope />
                Specialization
              </div>
              <div className="info-value">{doctor.specialization}</div>
            </div>

            {/* Qualification */}
            {doctor.qualification && (
              <div className="info-item">
                <div className="info-label">
                  <Award />
                  Qualification
                </div>
                <div className="info-value">{doctor.qualification}</div>
              </div>
            )}

            {/* Experience */}
            {doctor.experience > 0 && (
              <div className="info-item">
                <div className="info-label">
                  <Clock />
                  Experience
                </div>
                <div className="info-value">
                  <span className="experience-badge">
                    <Clock />
                    {doctor.experience} {doctor.experience === 1 ? 'year' : 'years'}
                  </span>
                </div>
              </div>
            )}

            {/* Phone */}
            {doctor.phone && (
              <div className="info-item">
                <div className="info-label">
                  <Phone />
                  Contact Number
                </div>
                <div className="info-value">{doctor.phone}</div>
              </div>
            )}

            {/* Address */}
            {doctor.address && (
              <div className="info-item">
                <div className="info-label">
                  <MapPin />
                  Clinic Address
                </div>
                <div className="info-value">{doctor.address}</div>
              </div>
            )}

            {/* Bio */}
            {doctor.bio && (
              <div className="info-item">
                <div className="info-label">
                  <FileText />
                  About Doctor
                </div>
                <div className="bio-section">
                  <div className="bio-text">{doctor.bio}</div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="info-item">
              <div className="info-label">
                {doctor.status === 'ACTIVE' ? <CheckCircle /> : <XCircle />}
                Current Status
              </div>
              <div className="info-value">
                <span className={`status-badge ${doctor.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                  {doctor.status === 'ACTIVE' ? <CheckCircle /> : <XCircle />}
                  {doctor.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="doctor-detail-footer">
          <button className="modal-button button-secondary" onClick={onClose}>
            <X />
            Close
          </button>
          {doctor.status === 'ACTIVE' && (
            <button className="modal-button button-primary" onClick={handleBookAppointment}>
              <Calendar />
              Book Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;

