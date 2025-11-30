import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Clock, Star, Award, Video, 
  CheckCircle, XCircle, GitCompare, X, Calendar,
  TrendingUp, DollarSign, User, Mail, Phone, FileText
} from 'lucide-react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { doctorService } from '../../services/doctorService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import './PatientSearch.css';

// Mock condition to specialty mapping for patient search
const conditionToCategory = {
  'diabetes': 'Chronic Care',
  'hypertension': 'Cardiac Care',
  'asthma': 'Respiratory Care',
  'arthritis': 'Orthopedic Care',
  'depression': 'Mental Health',
  'pregnancy': 'Maternity Care',
  'pediatric': 'Pediatric Care',
  'elderly': 'Geriatric Care'
};

const PatientSearch = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [highlightedPatientId, setHighlightedPatientId] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [patientTreatments, setPatientTreatments] = useState([]);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);
  const videoRefs = useRef({});

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
      setSuggestedCategories([]);
      return;
    }

    // Analyze search and suggest categories
    const lowerSearch = searchTerm.toLowerCase();
    const suggestions = [];
    
    Object.keys(conditionToCategory).forEach(condition => {
      if (lowerSearch.includes(condition)) {
        suggestions.push(conditionToCategory[condition]);
      }
    });

    setSuggestedCategories([...new Set(suggestions)]);

    // Filter patients based on search
    const filtered = patients.filter(patient => {
      const searchLower = searchTerm.toLowerCase();
      return (
        patient.fullName?.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.id?.toString().includes(searchLower) ||
        patient.phone?.toLowerCase().includes(searchLower)
      );
    });

    // Calculate match scores
    const patientsWithScores = filtered.map(patient => {
      let score = 50; // Base score
      
      // Category match
      if (suggestions.length > 0) {
        score += 20;
      }
      
      // Treatment history bonus (using treatmentCount from patient data)
      const treatmentCount = patient.treatmentCount || 0;
      if (treatmentCount > 5) score += 15;
      else if (treatmentCount > 2) score += 10;
      
      // Recent activity bonus
      if (patient.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
        if (age > 0 && age < 100) score += 5;
      }
      
      // Last visit recency bonus
      if (patient.lastVisit?.includes('days')) score += 10;
      else if (patient.lastVisit?.includes('week')) score += 5;
      
      return { ...patient, matchScore: Math.min(100, score) };
    });

    // Sort by match score
    patientsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    setFilteredPatients(patientsWithScores);
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await doctorService.searchPatients('');
      
      // Enhance patients with mock data for demo
      const enhanced = data.map((patient, index) => ({
        ...patient,
        matchScore: 75 + Math.floor(Math.random() * 20),
        lastVisit: index % 3 === 0 ? '2 days ago' : 
                  index % 3 === 1 ? '1 week ago' : 
                  '3 weeks ago',
        treatmentCount: Math.floor(Math.random() * 10),
        location: {
          lat: 10.762622 + (Math.random() - 0.5) * 0.1,
          lng: 106.660172 + (Math.random() - 0.5) * 0.1,
          address: patient.address || `123 Medical Street, District ${index + 1}`
        },
        // Video URL priority: 1) From API, 2) From public root, 3) null (show initial)
        videoStoryUrl: patient.videoStoryUrl || 
                      (patient.id ? `/patient-${patient.id}.mp4` : null)
      }));
      
      setPatients(enhanced);
      setFilteredPatients(enhanced);
      setError('');
    } catch (err) {
      setError('Failed to load patients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setLoadingTreatments(true);
      const [patient, treatments] = await Promise.all([
        doctorService.getPatientById(id),
        doctorService.getPatientTreatments(id),
      ]);
      setSelectedPatient(patient);
      setPatientTreatments(treatments);
    } catch (err) {
      setError('Failed to load patient details');
      console.error(err);
    } finally {
      setLoadingTreatments(false);
    }
  };

  const handleCardClick = (patientId) => {
    setHighlightedPatientId(patientId);
  };

  const handlePinClick = (patientId) => {
    setHighlightedPatientId(patientId);
    const element = document.getElementById(`patient-card-${patientId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleCompare = (patient) => {
    if (compareList.find(p => p.id === patient.id)) {
      setCompareList(compareList.filter(p => p.id !== patient.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, patient]);
    }
  };

  const handleVideoHover = (patientId, isHovering) => {
    if (isHovering) {
      setHoveredVideoId(patientId);
      const video = videoRefs.current[patientId];
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Video failed to load, keep showing initial
        });
      }
    } else {
      setHoveredVideoId(null);
      const video = videoRefs.current[patientId];
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    }
  };

  const handleVideoError = (patientId) => {
    // Hide video on error, show initial instead
    const video = videoRefs.current[patientId];
    if (video) {
      video.style.display = 'none';
    }
  };

  return (
    <DoctorLayout>
      <div className="smart-patient-finder">
        {/* AI Search Bar */}
        <div className="ai-search-container">
          <div className="ai-search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search patients by name, email, ID, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ai-search-input"
            />
          </div>
          
          <AnimatePresence>
            {suggestedCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="suggested-categories"
              >
                <span className="suggestion-label">Suggested Categories:</span>
                {suggestedCategories.map((category, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="category-tag"
                  >
                    {category}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Split Screen Layout */}
        <div className="finder-layout">
          {/* Left Panel: Patient Cards */}
          <div className="patients-panel">
            {loading && patients.length === 0 ? (
              <div className="loading-container">
                <Loading message="Loading patients..." />
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="empty-state">
                <Search size={48} />
                <p>No patients found matching your criteria</p>
              </div>
            ) : (
              <div className="patients-list">
                {filteredPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    id={`patient-card-${patient.id}`}
                    className={`patient-card ${highlightedPatientId === patient.id ? 'highlighted' : ''} ${compareList.find(p => p.id === patient.id) ? 'in-compare' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleCardClick(patient.id)}
                    whileHover={{ y: -4 }}
                  >
                    {/* Match Score Badge */}
                    <div className="match-score-badge">
                      {patient.matchScore || 85}% Match
                    </div>

                    {/* Video Story Ring */}
                    <div 
                      className="video-story-ring"
                      onMouseEnter={() => handleVideoHover(patient.id, true)}
                      onMouseLeave={() => handleVideoHover(patient.id, false)}
                    >
                      <div className="video-ring-container">
                        {patient.videoStoryUrl && (
                          <video
                            ref={el => videoRefs.current[patient.id] = el}
                            className="video-story"
                            muted
                            loop
                            playsInline
                            onError={() => handleVideoError(patient.id)}
                          >
                            <source src={patient.videoStoryUrl} type="video/mp4" />
                          </video>
                        )}
                        <div className="video-ring-overlay">
                          <div className="patient-initial">
                            {patient.fullName?.charAt(0) || 'P'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="patient-info">
                      <h3 className="patient-name">{patient.fullName}</h3>
                      <div className="patient-id">
                        <User size={14} />
                        <span>ID: {patient.id}</span>
                      </div>
                      
                      <div className="patient-meta">
                        <div className="meta-item">
                          <Mail size={14} />
                          <span>{patient.email || 'No email'}</span>
                        </div>
                        <div className="meta-item">
                          <Phone size={14} />
                          <span>{patient.phone || 'No phone'}</span>
                        </div>
                      </div>

                      {patient.dateOfBirth && (
                        <div className="patient-dob">
                          <Calendar size={14} />
                          <span>DOB: {formatDate(patient.dateOfBirth)}</span>
                        </div>
                      )}

                      <div className="visit-badge">
                        <Clock size={14} />
                        <span>Last visit: {patient.lastVisit || 'N/A'}</span>
                      </div>

                      <div className="patient-actions">
                        <motion.button
                          className="btn-primary"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(patient.id);
                          }}
                        >
                          <FileText size={16} />
                          View Details
                        </motion.button>
                        <motion.button
                          className="btn-secondary"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(patient.id);
                          }}
                        >
                          <FileText size={16} />
                          Treatments
                        </motion.button>
                      </div>
                    </div>

                    {/* Compare Checkbox */}
                    <div className="compare-checkbox">
                      <input
                        type="checkbox"
                        checked={!!compareList.find(p => p.id === patient.id)}
                        onChange={() => toggleCompare(patient)}
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
                <span>Patient Locations</span>
              </div>
              <div className="map-legend">
                <div className="legend-item">
                  <div className="pin green-pin"></div>
                  <span>Recent Visit</span>
                </div>
                <div className="legend-item">
                  <div className="pin red-pin"></div>
                  <span>No Recent Visit</span>
                </div>
              </div>
              
              {/* Mock Map */}
              <div className="mock-map">
                {filteredPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    className={`map-pin ${patient.lastVisit?.includes('days') ? 'green' : 'red'} ${highlightedPatientId === patient.id ? 'highlighted' : ''}`}
                    style={{
                      left: `${50 + (patient.location?.lng - 106.660172) * 1000}%`,
                      top: `${50 + (patient.location?.lat - 10.762622) * 1000}%`,
                    }}
                    onClick={() => handlePinClick(patient.id)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="pin-tooltip">
                      <strong>{patient.fullName}</strong>
                      <span>ID: {patient.id}</span>
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
                <span>Comparing {compareList.length} Patient{compareList.length > 1 ? 's' : ''}</span>
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
                  <h2>Compare Patients</h2>
                  <button onClick={() => setShowCompareModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                
                <div className="compare-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Criteria</th>
                        {compareList.map(patient => (
                          <th key={patient.id}>
                            <div className="compare-patient-header">
                              <div className="compare-avatar">
                                {patient.fullName?.charAt(0) || 'P'}
                              </div>
                              <div>
                                <div className="compare-name">{patient.fullName}</div>
                                <div className="compare-id">ID: {patient.id}</div>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><Mail size={16} /> Email</td>
                        {compareList.map(patient => (
                          <td key={patient.id}>
                            {patient.email || '-'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td><Phone size={16} /> Phone</td>
                        {compareList.map(patient => (
                          <td key={patient.id}>
                            {patient.phone || '-'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td><Calendar size={16} /> Date of Birth</td>
                        {compareList.map(patient => (
                          <td key={patient.id}>
                            {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '-'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td><Clock size={16} /> Last Visit</td>
                        {compareList.map(patient => (
                          <td key={patient.id}>
                            {patient.lastVisit || 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td><FileText size={16} /> Treatment Count</td>
                        {compareList.map(patient => (
                          <td key={patient.id}>
                            {patient.treatmentCount || 0}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td><TrendingUp size={16} /> Match Score</td>
                        {compareList.map(patient => (
                          <td key={patient.id}>
                            <div className="match-display">
                              {patient.matchScore || 85}%
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
                    View Best Match
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <PatientDetailModal
            patient={selectedPatient}
            treatments={patientTreatments}
            loadingTreatments={loadingTreatments}
            onClose={() => {
              setSelectedPatient(null);
              setPatientTreatments([]);
            }}
          />
        )}
      </div>
    </DoctorLayout>
  );
};

const PatientDetailModal = ({ patient, treatments, loadingTreatments, onClose }) => {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="patient-detail-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Patient Details</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="patient-detail-grid">
          <div><strong>ID:</strong> {patient.id}</div>
          <div><strong>Name:</strong> {patient.fullName}</div>
          <div><strong>Email:</strong> {patient.email || '-'}</div>
          <div><strong>Phone:</strong> {patient.phone || '-'}</div>
          <div><strong>Date of Birth:</strong> {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '-'}</div>
          <div><strong>Gender:</strong> {patient.gender || '-'}</div>
          <div><strong>Address:</strong> {patient.address || '-'}</div>
          <div><strong>Emergency Contact:</strong> {patient.emergencyContact || '-'}</div>
        </div>

        <div className="treatments-section">
          <h3>Treatment History</h3>
          {loadingTreatments ? (
            <div className="loading-treatments">Loading treatments...</div>
          ) : treatments.length === 0 ? (
            <div className="no-treatments">
              No treatments found
            </div>
          ) : (
            <div className="treatments-list">
              {treatments.map((treatment) => (
                <div key={treatment.id} className="treatment-item">
                  <div><strong>Date:</strong> {formatDate(treatment.createdAt)}</div>
                  {treatment.diagnosis && <div><strong>Diagnosis:</strong> {treatment.diagnosis}</div>}
                  {treatment.prescription && <div><strong>Prescription:</strong> {treatment.prescription}</div>}
                  {treatment.followUpDate && <div><strong>Follow-up:</strong> {formatDate(treatment.followUpDate)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PatientSearch;
