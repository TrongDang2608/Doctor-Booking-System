import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockSpecialties, searchDoctors } from '../data/mockData';
import Navbar from '../components/common/Navbar';
import './Specialties.css';

const Specialties = () => {
  const [specialties] = useState(mockSpecialties);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  return (
    <div className="specialties-page">
      <Navbar />
      
      <div className="specialties-content">
        <div className="specialties-header">
          <h1 className="page-title">Chuyên khoa</h1>
          <p className="page-subtitle">
            Chọn chuyên khoa phù hợp với nhu cầu khám bệnh của bạn
          </p>
        </div>

        <div className="specialties-grid">
          {specialties.map(specialty => {
            const doctors = searchDoctors('', { specialty: specialty.name });
            return (
              <Link
                key={specialty.id}
                to={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
                className="specialty-card"
              >
                <div className="specialty-icon">{specialty.icon}</div>
                <h3 className="specialty-name">{specialty.name}</h3>
                <p className="specialty-description">{specialty.description}</p>
                <div className="specialty-meta">
                  <span className="doctor-count">
                    <i data-feather="users"></i>
                    {doctors.length} bác sĩ
                  </span>
                </div>
                <div className="specialty-arrow">
                  <i data-feather="arrow-right"></i>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Specialties;

