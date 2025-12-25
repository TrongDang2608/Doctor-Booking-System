import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, Award, Calendar,
  TrendingUp, DollarSign, User, Clock
} from 'lucide-react';
import PatientLayout from '../../components/patient/PatientLayout';
import { patientService } from '../../services/patientService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import DoctorDetail from '../../components/patient/DoctorDetail';
import './DoctorSearch.css';

// Symptom to specialty mapping
const symptomToSpecialty = {
  'headache': 'Neurologist',
  'back pain': 'Orthopedist',
  'chest pain': 'Cardiologist',
  'fever': 'General Practitioner',
  'cough': 'Pulmonologist',
  'stomach': 'Gastroenterologist',
  'skin': 'Dermatologist',
  'eye': 'Ophthalmologist',
  'ear': 'ENT Specialist',
  'mental': 'Psychiatrist'
};

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedSpecialties, setSuggestedSpecialties] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [highlightedDoctorId, setHighlightedDoctorId] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDoctors(doctors);
      setSuggestedSpecialties([]);
      return;
    }

    // Analyze symptoms and suggest specialties
    const lowerSearch = searchTerm.toLowerCase();
    const suggestions = [];

    Object.keys(symptomToSpecialty).forEach(symptom => {
      if (lowerSearch.includes(symptom)) {
        suggestions.push(symptomToSpecialty[symptom]);
      }
    });

    setSuggestedSpecialties([...new Set(suggestions)]);

    // Filter doctors
    const filtered = doctors.filter(doctor => {
      const searchLower = searchTerm.toLowerCase();
      return (
        doctor.fullName?.toLowerCase().includes(searchLower) ||
        doctor.specialization?.toLowerCase().includes(searchLower) ||
        doctor.qualification?.toLowerCase().includes(searchLower)
      );
    });

    // Calculate match scores
    const doctorsWithScores = filtered.map(doctor => {
      let score = 50;
      if (suggestions.length > 0 &&
        doctor.specialization &&
        suggestions.some(s => doctor.specialization.includes(s))) {
        score += 30;
      }
      if (doctor.experience > 10) score += 10;
      if (doctor.experience > 5) score += 5;
      if (doctor.rating > 4.5) score += 8;
      else if (doctor.rating > 4) score += 5;
      if (doctor.nextAvailableSlot) score += 2;

      return { ...doctor, matchScore: Math.min(100, score) };
    });

    doctorsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    setFilteredDoctors(doctorsWithScores);
  }, [searchTerm, doctors]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await patientService.searchDoctors('');

      // Enhance doctors with mock data
      const enhanced = data.map((doctor, index) => ({
        ...doctor,
        matchScore: 85 + Math.floor(Math.random() * 15),
        rating: doctor.rating || (4 + Math.random() * 1),
        nextAvailableSlot: index % 3 === 0 ? 'Today at 14:00' :
          index % 3 === 1 ? 'Tomorrow at 10:00' : 'Available Now',
        isAvailable: index % 4 !== 0,
        price: 200000 + Math.floor(Math.random() * 300000)
      }));

      setDoctors(enhanced);
      setFilteredDoctors(enhanced);
      setError('');
    } catch (err) {
      setError('Failed to load doctors');
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

  const handleCardHover = (doctorId) => {
    setHighlightedDoctorId(doctorId);
  };

  return (
    <PatientLayout>
      <div className="intelligent-doctor-finder">
        {/* AI Symptom Decoder Search */}
        <div className="ai-search-hero">
          <div className="search-glow-wrapper">
            <div className="search-icon-wrapper">
              <Search className="search-icon" size={24} />
            </div>
            <input
              type="text"
              placeholder="Describe your symptoms (e.g., severe headache, back pain)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ai-search-input"
            />
          </div>

          {/* Smart Tags */}
          <AnimatePresence>
            {suggestedSpecialties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="smart-tags"
              >
                <span className="tags-label">RECOMMENDED</span>
                {suggestedSpecialties.map((specialty, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="smart-tag"
                  >
                    {specialty}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Doctor List */}
        <div className="doctors-container">
          {loading && doctors.length === 0 ? (
            <div className="loading-state">
              <Loading message="Scanning for best matches..." />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="empty-state">
              <Search size={48} />
              <p>No doctors match your search</p>
            </div>
          ) : (
            <div className="holographic-cards-list">
              {filteredDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`holo-card ${highlightedDoctorId === doctor.id ? 'highlighted' : ''}`}
                  onMouseEnter={() => handleCardHover(doctor.id)}
                  onMouseLeave={() => handleCardHover(null)}
                >
                  {/* Simple Avatar */}
                  <div className="card-avatar-section">
                    <div className={`simple-avatar ${doctor.isAvailable ? 'online' : ''}`}>
                      <div className="avatar-circle">
                        {doctor.fullName?.charAt(0) || 'D'}
                      </div>
                      {doctor.isAvailable && <div className="online-indicator"></div>}
                    </div>
                    <div className="neon-match-badge">
                      <TrendingUp size={12} />
                      {doctor.matchScore || 95}%
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="card-info-section">
                    <div className="card-header">
                      <div>
                        <h3 className="doctor-name-holo">Dr. {doctor.fullName}</h3>
                        <div className="doctor-specialty-holo">
                          <Award size={14} />
                          <span>{doctor.specialization || 'General Practitioner'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="meta-row">
                      <div className="meta-chip">
                        <User size={14} />
                        {doctor.experience || 5}+ yrs
                      </div>
                      <div className="meta-chip">
                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                        {doctor.rating?.toFixed(1) || '4.5'}
                      </div>
                      <div className="meta-chip">
                        <DollarSign size={14} />
                        {(doctor.price / 1000).toFixed(0)}k
                      </div>
                    </div>

                    {doctor.isAvailable && (
                      <div className="availability-tag">
                        <Clock size={14} />
                        {doctor.nextAvailableSlot}
                      </div>
                    )}

                    <div className="card-actions">
                      <motion.button
                        className="btn-book-fast"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleViewDetails(doctor.id)}
                      >
                        <Calendar size={16} />
                        Đặt Lịch
                      </motion.button>
                      <motion.button
                        className="btn-profile-glass"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleViewDetails(doctor.id)}
                      >
                        Hồ Sơ
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Detail Modal */}
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