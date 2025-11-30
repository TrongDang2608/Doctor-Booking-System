import { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/common/DataTable';
import DoctorForm from '../../components/admin/DoctorForm';
import './adminPages.css';

const DoctorManagement = () => {
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  useEffect(() => {
    loadAllDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    if (searchTerm.trim() === '') {
      return allDoctors;
    }
    const term = searchTerm.toLowerCase();
    return allDoctors.filter(doctor => 
      doctor.fullName?.toLowerCase().includes(term) ||
      doctor.specialization?.toLowerCase().includes(term) ||
      doctor.email?.toLowerCase().includes(term)
    );
  }, [searchTerm, allDoctors]);

  useEffect(() => {
    setDoctors(filteredDoctors);
  }, [filteredDoctors]);

  const loadAllDoctors = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllDoctors('');
      setAllDoctors(data);
      setError('');
    } catch (err) {
      setError('Failed to load doctors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDoctor(null);
    setShowForm(true);
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }

    try {
      await adminService.deleteDoctor(id);
      loadAllDoctors();
      setError('');
    } catch (err) {
      setError('Failed to delete doctor');
      console.error(err);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDoctor(null);
    loadAllDoctors();
  };

  if (loading && doctors.length === 0) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-title">
            Doctor Management
          </h1>
          <button
            onClick={handleCreate}
            className="btn-primary"
          >
            + Add Doctor
          </button>
        </div>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <div className="search-container">
          <input
            type="text"
            placeholder="Search doctors by name, specialization, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {showForm && (
          <DoctorForm
            doctor={editingDoctor}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        )}

        <DataTable
          columns={[
            { header: 'Name', accessor: 'fullName' },
            { header: 'Specialization', accessor: 'specialization' },
            { header: 'Email', accessor: 'email' },
            { 
              header: 'Phone', 
              accessor: 'phone',
              render: (doctor) => doctor.phone || '-'
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (doctor) => (
                <span className="status-badge" style={{
                  backgroundColor: doctor.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: doctor.status === 'ACTIVE' ? '#10B981' : '#EF4444',
                }}>
                  {doctor.status}
                </span>
              )
            },
            {
              header: 'Actions',
              align: 'center',
              render: (doctor) => (
                <div className="action-buttons">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(doctor);
                    }}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doctor.id);
                    }}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              )
            }
          ]}
          data={doctors}
          loading={loading && doctors.length === 0}
          emptyMessage={searchTerm ? `No doctors found matching "${searchTerm}"` : 'No doctors found'}
        />
      </div>
    </AdminLayout>
  );
};

export default DoctorManagement;

