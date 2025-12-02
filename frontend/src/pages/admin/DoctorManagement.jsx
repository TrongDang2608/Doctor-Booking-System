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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
            <p className="text-gray-600 mt-1">{doctors.length} total doctors</p>
          </div>
          <button 
            onClick={handleCreate} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm"
          >
            <span className="text-xl">+</span>
            Add Doctor
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <span className="text-lg">⚠️</span>
            <span className="flex-1">{error}</span>
            <button 
              onClick={() => setError('')} 
              className="text-red-800 hover:text-red-900 font-bold text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Search Section */}
        <div className="relative">
          <div className="relative max-w-2xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              placeholder="Search doctors by name, specialization, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xl leading-none"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Doctor Form Modal */}
        {showForm && (
          <DoctorForm
            doctor={editingDoctor}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        )}

        {/* Data Table */}
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
                <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                  doctor.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {doctor.status}
                </span>
              )
            },
            {
              header: 'Actions',
              align: 'center',
              render: (doctor) => (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(doctor);
                    }}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doctor.id);
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
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

