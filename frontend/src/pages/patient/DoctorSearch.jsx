import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Clock, Star, Award, Video, 
  CheckCircle, XCircle, GitCompare, X, Calendar,
  TrendingUp, DollarSign, User
} from 'lucide-react';
import PatientLayout from '../../components/patient/PatientLayout';
import { patientService } from '../../services/patientService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import DoctorDetail from '../../components/patient/DoctorDetail';
import './DoctorSearch.css';

// Mock symptom to specialty mapping
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
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);
  const videoRefs = useRef({});

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

    // Filter doctors based on search
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
      let score = 50; // Base score
      
      // Specialty match
      if (suggestions.length > 0 && 
          doctor.specialization && 
          suggestions.some(s => doctor.specialization.includes(s))) {
        score += 30;
      }
      
      // Experience bonus
      if (doctor.experience > 10) score += 10;
      if (doctor.experience > 5) score += 5;
      
      // Rating bonus
      if (doctor.rating > 4.5) score += 8;
      else if (doctor.rating > 4) score += 5;
      
      // Availability bonus
      if (doctor.nextAvailableSlot) score += 2;
      
      return { ...doctor, matchScore: Math.min(100, score) };
    });

    // Sort by match score
    doctorsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    setFilteredDoctors(doctorsWithScores);
  }, [searchTerm, doctors]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await patientService.searchDoctors('');
      
      // Enhance doctors with mock data for demo
      const enhanced = data.map((doctor, index) => ({
        ...doctor,
        matchScore: 85 + Math.floor(Math.random() * 15),
        rating: doctor.rating || (4 + Math.random() * 1),
        nextAvailableSlot: index % 3 === 0 ? 'Today at 14:00' : 
                          index % 3 === 1 ? 'Tomorrow at 10:00' : 
                          'Available Now',
        isAvailable: index % 4 !== 0,
        location: {
          lat: 10.762622 + (Math.random() - 0.5) * 0.1,
          lng: 106.660172 + (Math.random() - 0.5) * 0.1,
          address: doctor.address || `123 Medical Street, District ${index + 1}`
        },
        price: 200000 + Math.floor(Math.random() * 300000),
        // Video URL priority: 1) From API, 2) From public root (/doctor-{id}.mp4), 3) From videos folder, 4) null (show initial)
        videoStoryUrl: doctor.videoStoryUrl || 
                      doctor.videoUrl || 
                      (doctor.id ? `/doctor-${doctor.id}.mp4` : null)
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

  const handleCardClick = (doctorId) => {
    setHighlightedDoctorId(doctorId);
  };

  const handlePinClick = (doctorId) => {
    setHighlightedDoctorId(doctorId);
    const element = document.getElementById(`doctor-card-${doctorId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleCompare = (doctor) => {
    if (compareList.find(d => d.id === doctor.id)) {
      setCompareList(compareList.filter(d => d.id !== doctor.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, doctor]);
    }
  };

  const handleVideoHover = (doctorId, isHovering) => {
    if (isHovering) {
      setHoveredVideoId(doctorId);
      const video = videoRefs.current[doctorId];
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Video failed to load, keep showing initial
        });
      }
    } else {
      setHoveredVideoId(null);
      const video = videoRefs.current[doctorId];
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    }
  };

  const handleVideoError = (doctorId) => {
    // Hide video on error, show initial instead
    const video = videoRefs.current[doctorId];
    if (video) {
      video.style.display = 'none';
    }
  };

  return (
    <PatientLayout>
      <div className="smart-doctor-finder">
        {/* AI Search Bar */}
        <div className="ai-search-container">
          <div className="ai-search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Describe your symptoms (e.g., severe headache, back pain)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ai-search-input"
            />
          </div>
          
          <AnimatePresence>
            {suggestedSpecialties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="suggested-specialties"
              >
                <span className="suggestion-label">Suggested Specialists:</span>
                {suggestedSpecialties.map((specialty, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="specialty-tag"
                  >
                    {specialty}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Split Screen Layout */}
        <div className="finder-layout">
          {/* Left Panel: Doctor Cards */}
          <div className="doctors-panel">
            {loading && doctors.length === 0 ? (
              <div className="loading-container">
                <Loading message="Finding the best doctors for you..." />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="empty-state">
                <Search size={48} />
                <p>No doctors found matching your criteria</p>
              </div>
            ) : (
              <div className="doctors-list">
                {filteredDoctors.map((doctor) => (
                  <motion.div
                    key={doctor.id}
                    id={`doctor-card-${doctor.id}`}
                    className={`doctor-card ${highlightedDoctorId === doctor.id ? 'highlighted' : ''} ${compareList.find(d => d.id === doctor.id) ? 'in-compare' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleCardClick(doctor.id)}
                    whileHover={{ y: -4 }}
                  >
                    {/* Match Score Badge */}
                    <div className="match-score-badge">
                      {doctor.matchScore || 95}% Match
                    </div>

                    {/* Video Story Ring */}
                    <div 
                      className="video-story-ring"
                      onMouseEnter={() => handleVideoHover(doctor.id, true)}
                      onMouseLeave={() => handleVideoHover(doctor.id, false)}
                    >
                      <div className="video-ring-container">
                        {doctor.videoStoryUrl && (
                          <video
                            ref={el => videoRefs.current[doctor.id] = el}
                            className="video-story"
                            muted
                            loop
                            playsInline
                            onError={() => handleVideoError(doctor.id)}
                          >
                            <source src={doctor.videoStoryUrl} type="video/mp4" />
                          </video>
                        )}
                        <div className="video-ring-overlay">
                          <div className="doctor-initial">
                            {doctor.fullName?.charAt(0) || 'D'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="doctor-info">
                      <h3 className="doctor-name">Dr. {doctor.fullName}</h3>
                      <div className="doctor-specialty">
                        <Award size={14} />
                        <span>{doctor.specialization || 'General Practitioner'}</span>
                      </div>
                      
                      <div className="doctor-meta">
                        <div className="meta-item">
                          <User size={14} />
                          <span>{doctor.experience || 5}+ years</span>
                        </div>
                        <div className="meta-item">
                          <Star size={14} fill="#fbbf24" color="#fbbf24" />
                          <span>{doctor.rating?.toFixed(1) || '4.5'}</span>
                        </div>
                      </div>

                      <div className="availability-badge">
                        <Clock size={14} />
                        <span className={doctor.nextAvailableSlot?.includes('Now') ? 'available-now' : ''}>
                          {doctor.nextAvailableSlot || 'Check availability'}
                        </span>
                      </div>

                      <div className="doctor-actions">
                        <motion.button
                          className="btn-primary"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(doctor.id);
                          }}
                        >
                          <Calendar size={16} />
                          Book Now
                        </motion.button>
                        <motion.button
                          className="btn-secondary"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(doctor.id);
                          }}
                        >
                          View Profile
                        </motion.button>
                      </div>
                    </div>

                    {/* Compare Checkbox */}
                    <div className="compare-checkbox">
                      <input
                        type="checkbox"
                        checked={!!compareList.find(d => d.id === doctor.id)}
                        onChange={() => toggleCompare(doctor)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label>Compare</label>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Interactive Map */}
          <div className="map-panel">
            <div className="map-container">
              <div className="map-header">
                <MapPin size={18} />
                <span>Doctor Locations</span>
              </div>
              <div className="map-legend">
                <div className="legend-item">
                  <div className="pin green-pin"></div>
                  <span>Available Now</span>
                </div>
                <div className="legend-item">
                  <div className="pin red-pin"></div>
                  <span>Fully Booked</span>
                </div>
              </div>
              
              {/* Mock Map */}
              <div className="mock-map">
                {filteredDoctors.map((doctor) => (
                  <motion.div
                    key={doctor.id}
                    className={`map-pin ${doctor.isAvailable ? 'green' : 'red'} ${highlightedDoctorId === doctor.id ? 'highlighted' : ''}`}
                    style={{
                      left: `${50 + (doctor.location?.lng - 106.660172) * 1000}%`,
                      top: `${50 + (doctor.location?.lat - 10.762622) * 1000}%`,
                    }}
                    onClick={() => handlePinClick(doctor.id)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="pin-tooltip">
                      <strong>Dr. {doctor.fullName}</strong>
                      <span>{doctor.specialization}</span>
                    </div>
                  </motion.div>
                ))}
                <div className="map-grid"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Compare Mode Floating Widget */}
        <AnimatePresence>
          {compareList.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="compare-widget"
              onClick={() => setShowCompareModal(true)}
            >
              <div className="compare-widget-content">
                <GitCompare size={20} />
                <span>Comparing {compareList.length} Doctor{compareList.length > 1 ? 's' : ''}</span>
                <button 
                  className="compare-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCompareList([]);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison Modal */}
        <AnimatePresence>
          {showCompareModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCompareModal(false)}
            >
              <motion.div
                className="compare-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Compare Doctors</h2>
                  <button onClick={() => setShowCompareModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                
                <div className="compare-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Criteria</th>
                        {compareList.map(doctor => (
                          <th key={doctor.id}>
                            <div className="compare-doctor-header">
                              <div className="compare-avatar">
                                {doctor.fullName?.charAt(0) || 'D'}
                              </div>
                              <div>
                                <div className="compare-name">Dr. {doctor.fullName}</div>
                                <div className="compare-specialty">{doctor.specialization}</div>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><DollarSign size={16} /> Price</td>
                        {compareList.map(doctor => (
                          <td key={doctor.id}>
                            {doctor.price?.toLocaleString('vi-VN')} VNĐ
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td><User size={16} /> Experience</td>
                        {compareList.map(doctor => (
                          <td key={doctor.id}>
                            {doctor.experience || 5}+ years
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td><Star size={16} /> Rating</td>
                        {compareList.map(doctor => (
                          <td key={doctor.id}>
                            <div className="rating-display">
                              <Star size={14} fill="#fbbf24" color="#fbbf24" />
                              {doctor.rating?.toFixed(1) || '4.5'}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td><Clock size={16} /> Availability</td>
                        {compareList.map(doctor => (
                          <td key={doctor.id}>
                            {doctor.nextAvailableSlot || 'Check availability'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td><TrendingUp size={16} /> Match Score</td>
                        {compareList.map(doctor => (
                          <td key={doctor.id}>
                            <div className="match-display">
                              {doctor.matchScore || 95}%
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="modal-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      if (compareList.length > 0) {
                        handleViewDetails(compareList[0].id);
                        setShowCompareModal(false);
                      }
                    }}
                  >
                    Book Best Match
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
