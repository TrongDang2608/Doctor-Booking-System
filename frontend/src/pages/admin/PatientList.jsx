import { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/common/DataTable';
import { formatDate } from '../../utils/formatDate';
import './adminPages.css';

const PatientList = () => {
  const [allPatients, setAllPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Load all patients on mount
  useEffect(() => {
    loadAllPatients();
  }, []);

  // Filter patients when searchTerm changes - optimized with useMemo
  const filteredPatients = useMemo(() => {
    if (searchTerm.trim() === '') {
      return allPatients;
    }
    const term = searchTerm.toLowerCase();
    return allPatients.filter(patient => 
      patient.fullName?.toLowerCase().includes(term) ||
      patient.id?.toString().includes(searchTerm) ||
      patient.email?.toLowerCase().includes(term)
    );
  }, [searchTerm, allPatients]);

  useEffect(() => {
    setPatients(filteredPatients);
  }, [filteredPatients]);

  const loadAllPatients = async () => {
    try {
      setLoading(true);
      // Load all patients with empty search
      const data = await adminService.searchPatients('');
      setAllPatients(data);
      setPatients(data);
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
      const patient = await adminService.getPatientById(id);
      setSelectedPatient(patient);
    } catch (err) {
      setError('Failed to load patient details');
      console.error(err);
    }
  };

  if (loading && patients.length === 0) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <h1 className="page-title">
          Patient Management
        </h1>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <div className="search-container">
          <input
            type="text"
            placeholder="Search patients by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <DataTable
          columns={[
            { header: 'ID', accessor: 'id' },
            { header: 'Name', accessor: 'fullName' },
            { header: 'Email', accessor: 'email' },
            { 
              header: 'Phone', 
              accessor: 'phone',
              render: (patient) => patient.phone || '-'
            },
            { 
              header: 'Date of Birth', 
              accessor: 'dateOfBirth',
              render: (patient) => patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '-'
            },
            {
              header: 'Actions',
              align: 'center',
              render: (patient) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(patient.id);
                  }}
                  className="btn-view"
                >
                  View Details
                </button>
              )
            }
          ]}
          data={patients}
          loading={loading && patients.length === 0}
          emptyMessage={searchTerm ? `No patients found matching "${searchTerm}"` : 'No patients found'}
          onRowClick={(patient) => handleViewDetails(patient.id)}
        />

        {selectedPatient && (
          <PatientDetailModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
        )}
      </div>
    </AdminLayout>
  );
};

const PatientDetailModal = ({ patient, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '2rem',
    }}>
      <div style={{
        backgroundColor: 'rgba(15, 15, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        color: '#e0e0e0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ margin: 0, color: '#e0e0e0' }}>Patient Details</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#aaa',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.color = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#aaa';
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
          <div><strong style={{ color: '#06b6d4' }}>ID:</strong> <span style={{ color: '#e0e0e0' }}>{patient.id}</span></div>
          <div><strong style={{ color: '#06b6d4' }}>Name:</strong> <span style={{ color: '#e0e0e0' }}>{patient.fullName}</span></div>
          <div><strong style={{ color: '#06b6d4' }}>Email:</strong> <span style={{ color: '#e0e0e0' }}>{patient.email}</span></div>
          <div><strong style={{ color: '#06b6d4' }}>Phone:</strong> <span style={{ color: '#e0e0e0' }}>{patient.phone || '-'}</span></div>
          <div><strong style={{ color: '#06b6d4' }}>Date of Birth:</strong> <span style={{ color: '#e0e0e0' }}>{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : '-'}</span></div>
          <div><strong style={{ color: '#06b6d4' }}>Gender:</strong> <span style={{ color: '#e0e0e0' }}>{patient.gender || '-'}</span></div>
          <div><strong style={{ color: '#06b6d4' }}>Address:</strong> <span style={{ color: '#e0e0e0' }}>{patient.address || '-'}</span></div>
          <div><strong style={{ color: '#06b6d4' }}>Emergency Contact:</strong> <span style={{ color: '#e0e0e0' }}>{patient.emergencyContact || '-'}</span></div>
          <div><strong style={{ color: '#06b6d4' }}>Emergency Phone:</strong> <span style={{ color: '#e0e0e0' }}>{patient.emergencyPhone || '-'}</span></div>
        </div>

        {patient.treatments && patient.treatments.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: '#e0e0e0', marginBottom: '1rem' }}>Treatment History</h3>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              marginTop: '1rem',
            }}>
              {patient.treatments.map((treatment) => (
                <div key={treatment.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ color: '#e0e0e0' }}><strong style={{ color: '#06b6d4' }}>Date:</strong> {formatDate(treatment.createdAt)}</div>
                  <div style={{ color: '#e0e0e0' }}><strong style={{ color: '#06b6d4' }}>Doctor:</strong> {treatment.doctorName}</div>
                  {treatment.diagnosis && <div style={{ color: '#e0e0e0' }}><strong style={{ color: '#06b6d4' }}>Diagnosis:</strong> {treatment.diagnosis}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="btn-cancel"
          style={{ marginTop: '20px' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PatientList;

