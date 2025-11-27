import { useEffect, useState } from 'react';
import PatientLayout from '../../components/patient/PatientLayout';
import { patientService } from '../../services/patientService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import DoctorDetail from '../../components/patient/DoctorDetail';
import '../patient/patientPages.css';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      loadDoctors();
      return;
    }
    const delayDebounce = setTimeout(() => {
      searchDoctors();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await patientService.searchDoctors('');
      setDoctors(data);
      setError('');
    } catch (err) {
      setError('Failed to load doctors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchDoctors = async () => {
    try {
      setLoading(true);
      const data = await patientService.searchDoctors(searchTerm);
      setDoctors(data);
      setError('');
    } catch (err) {
      setError('Failed to search doctors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const doctor = await patientService.getDoctorById(id);
      setSelectedDoctor(doctor);
    } catch (err) {
      setError('Failed to load doctor details');
      console.error(err);
    }
  };

  return (
    <PatientLayout>
      <div className="patient-page">
        <h1>Find Doctors</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="patient-card" style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Search by doctor name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '500px' }}
            />
          </div>
        </div>

        {loading && doctors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loading message="Loading doctors..." />
          </div>
        )}

        {!loading && doctors.length === 0 && (
          <div className="patient-card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#aaa' }}>No doctors found</p>
          </div>
        )}

        {!loading && doctors.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="patient-card"
              >
                <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#667eea' }}>
                  Dr. {doctor.fullName}
                </h3>
                <p style={{ margin: '0.5rem 0', color: '#aaa' }}>
                  <strong style={{ color: '#e0e0e0' }}>Specialization:</strong> {doctor.specialization}
                </p>
                {doctor.qualification && (
                  <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                    {doctor.qualification}
                  </p>
                )}
                {doctor.experience > 0 && (
                  <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                    {doctor.experience} years of experience
                  </p>
                )}
                {doctor.phone && (
                  <p style={{ margin: '0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>
                    📞 {doctor.phone}
                  </p>
                )}
                <button
                  onClick={() => handleViewDetails(doctor.id)}
                  className="btn btn-primary"
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedDoctor && (
          <DoctorDetail
            doctor={selectedDoctor}
            onClose={() => setSelectedDoctor(null)}
          />
        )}
      </div>
    </PatientLayout>
  );
};

export default DoctorSearch;

