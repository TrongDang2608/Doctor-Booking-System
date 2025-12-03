import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import DoctorForm from '../../components/admin/DoctorForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const DoctorManagement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

  // Initialize Feather Icons
  useEffect(() => {
    feather.replace();
  }, [doctors, showForm]);

  // Load doctor data when editing from URL
  useEffect(() => {
    if (id && allDoctors.length > 0) {
      const doctor = allDoctors.find(d => d.id === parseInt(id));
      if (doctor) {
        setEditingDoctor(doctor);
        setShowForm(true);
      }
    } else if (!id) {
      setShowForm(false);
      setEditingDoctor(null);
    }
  }, [id, allDoctors]);

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

  // Replace feather icons after doctors data changes
  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, [doctors, showForm]);

  const loadAllDoctors = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllDoctors('');
      setAllDoctors(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách bác sĩ');
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
    navigate(`/admin/doctors/edit/${doctor.id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này?')) {
      return;
    }

    try {
      await adminService.deleteDoctor(id);
      toast.success('Xóa bác sĩ thành công!', { position: 'top-right', autoClose: 3000 });
      loadAllDoctors();
      setError('');
    } catch (err) {
      const errorMsg = 'Không thể xóa bác sĩ';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const handleFormClose = () => {
    navigate('/admin/doctors');
    setShowForm(false);
    setEditingDoctor(null);
    loadAllDoctors();
  };

  if (loading && doctors.length === 0 && !id) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  // If showing form, render form layout
  if (showForm) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {editingDoctor ? 'Chỉnh Sửa Bác Sĩ' : 'Tạo Bác Sĩ Mới'}
              </h1>
              <p className="text-gray-600 mt-1">Cập nhật thông tin bác sĩ</p>
            </div>
            <button 
              onClick={() => navigate('/admin/doctors')} 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <i data-feather="arrow-left" className="w-5 h-5"></i>
              Quay lại danh sách
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorMessage 
              message={error} 
              onClose={() => setError('')} 
            />
          )}

          {/* Doctor Form */}
          <DoctorForm
            doctor={editingDoctor}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        </div>
        <ToastContainer />
      </AdminLayout>
    );
  }

  // Otherwise render list view
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Bác Sĩ</h1>
            <p className="text-gray-600 mt-1">Tổng số {doctors.length} bác sĩ</p>
          </div>
          <button 
            onClick={handleCreate} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm"
          >
            <span className="text-xl">+</span>
            Thêm bác sĩ
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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <i data-feather="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, chuyên khoa, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyên Khoa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? `Không tìm thấy bác sĩ khớp với "${searchTerm}"` : 'Không có bác sĩ'}
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialization}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          doctor.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {doctor.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(doctor)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <i data-feather="edit-2" className="w-4 h-4"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(doctor.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <i data-feather="trash-2" className="w-4 h-4"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer />
    </AdminLayout>
  );
};

export default DoctorManagement;

