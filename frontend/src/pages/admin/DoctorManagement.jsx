import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const DoctorManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'detail', 'delete'
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    address: '',
    bio: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadAllDoctors();
  }, []);

  // Initialize Feather Icons - Run after DOM updates with cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.feather) {
        window.feather.replace();
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [viewMode, doctors.length, showForm]);

  // Determine view mode based on URL
  useEffect(() => {
    const path = location.pathname;
    
    if (path.endsWith('/create')) {
      setViewMode('create');
      setShowForm(true);
      setEditingDoctor(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
        specialization: '',
        qualification: '',
        experience: '',
        address: '',
        bio: ''
      });
      setFormErrors({});
    } else if (path.includes('/delete')) {
      setViewMode('delete');
      setShowForm(false);
    } else if (path.includes('/edit')) {
      setViewMode('edit');
      setShowForm(true);
    } else if (id && !path.includes('/edit') && !path.includes('/delete')) {
      setViewMode('detail');
      setShowForm(false);
    } else {
      setViewMode('list');
      setShowForm(false);
      setEditingDoctor(null);
    }
  }, [location.pathname, id]);

  // Load doctor data when viewing/editing from URL
  useEffect(() => {
    if (id && allDoctors.length > 0 && (viewMode === 'edit' || viewMode === 'detail' || viewMode === 'delete')) {
      const doctor = allDoctors.find(d => d.id === parseInt(id));
      if (doctor) {
        setEditingDoctor(doctor);
        if (viewMode === 'edit') {
          setFormData({
            username: doctor.username,
            email: doctor.email,
            password: '',
            fullName: doctor.fullName,
            phone: doctor.phone || '',
            specialization: doctor.specialization || '',
            qualification: doctor.qualification || '',
            experience: doctor.experience || '',
            address: doctor.address || '',
            bio: doctor.bio || ''
          });
          setFormErrors({});
        }
      }
    }
  }, [id, allDoctors, viewMode]);

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
      setError('Không thể tải danh sách bác sĩ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/doctors/create');
  };

  const handleView = (doctor) => {
    navigate(`/admin/doctors/${doctor.id}`);
  };

  const handleEdit = (doctor) => {
    navigate(`/admin/doctors/${doctor.id}/edit`);
  };

  const handleDeleteClick = (doctor) => {
    navigate(`/admin/doctors/${doctor.id}/delete`);
  };

  const handleDeleteConfirm = async () => {
    if (!editingDoctor) return;

    try {
      await adminService.deleteDoctor(editingDoctor.id);
      toast.success('Xóa bác sĩ thành công!', { position: 'top-right', autoClose: 3000 });
      
      // Reset states BEFORE navigation
      setViewMode('list');
      setEditingDoctor(null);
      setShowForm(false);
      setError('');
      
      // Reload data
      await loadAllDoctors();
      
      // Navigate to list
      navigate('/admin/doctors');
    } catch (err) {
      const errorMsg = 'Không thể xóa bác sĩ';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const handleDeleteCancel = () => {
    setViewMode('list');
    setEditingDoctor(null);
    setShowForm(false);
    navigate('/admin/doctors');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingDoctor) {
        // Update
        const updateData = {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: formData.experience,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
        };
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        } else {
          updateData.password = 'current_password_unchanged';
        }
        await adminService.updateDoctor(editingDoctor.id, updateData);
        toast.success('Cập nhật bác sĩ thành công!', { position: 'top-right', autoClose: 3000 });
      } else {
        // Create
        await adminService.createDoctor(formData);
        toast.success('Tạo bác sĩ thành công!', { position: 'top-right', autoClose: 3000 });
      }

      // Reset states BEFORE navigation
      setViewMode('list');
      setShowForm(false);
      setEditingDoctor(null);
      setError('');
      
      // Reload data
      await loadAllDoctors();
      
      // Navigate to list
      navigate('/admin/doctors');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể lưu thông tin bác sĩ';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmModal = () => {
    if (viewMode !== 'delete' || !editingDoctor) return null;

    return (
      <AdminLayout>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <i data-feather="alert-triangle" className="w-6 h-6 text-red-600"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Xác Nhận Xóa</h2>
                <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 mb-2">
                Bạn có chắc chắn muốn xóa bác sĩ này?
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>ID:</strong> {editingDoctor.id}</p>
                <p><strong>Họ và Tên:</strong> {editingDoctor.fullName}</p>
                <p><strong>Email:</strong> {editingDoctor.email}</p>
                <p><strong>Chuyên khoa:</strong> {editingDoctor.specialization}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </AdminLayout>
    );
  };

  // Detail View Modal Component
  const DoctorDetailModal = () => {
    if (viewMode !== 'detail' || !editingDoctor) return null;

    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Bác Sĩ</h1>
            <button 
              onClick={() => navigate('/admin/doctors')} 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <i data-feather="arrow-left" className="w-5 h-5"></i>
              Quay lại danh sách
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
                <p className="text-lg text-gray-900">{editingDoctor.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Họ và Tên</label>
                <p className="text-lg text-gray-900">{editingDoctor.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-lg text-gray-900">{editingDoctor.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
                <p className="text-lg text-gray-900">{editingDoctor.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Chuyên khoa</label>
                <p className="text-lg text-gray-900">{editingDoctor.specialization || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Bằng cấp</label>
                <p className="text-lg text-gray-900">{editingDoctor.qualification || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Kinh nghiệm</label>
                <p className="text-lg text-gray-900">{editingDoctor.experience ? `${editingDoctor.experience} năm` : '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                  editingDoctor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {editingDoctor.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Địa chỉ</label>
                <p className="text-lg text-gray-900">{editingDoctor.address || '-'}</p>
              </div>
              {editingDoctor.bio && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tiểu sử</label>
                  <p className="text-lg text-gray-900">{editingDoctor.bio}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => handleEdit(editingDoctor)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i data-feather="edit-2" className="w-4 h-4"></i>
                Chỉnh sửa
              </button>
              <button
                onClick={() => handleDeleteClick(editingDoctor)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <i data-feather="trash-2" className="w-4 h-4"></i>
                Xóa
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </AdminLayout>
    );
  };

  if (viewMode === 'delete') {
    return <DeleteConfirmModal />;
  }

  if (viewMode === 'detail') {
    return <DoctorDetailModal />;
  }

  if (loading && doctors.length === 0 && !id) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  // If showing form, render form layout
  if (showForm || viewMode === 'create' || viewMode === 'edit') {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {viewMode === 'edit' || editingDoctor ? 'Chỉnh Sửa Bác Sĩ' : 'Tạo Bác Sĩ Mới'}
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
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên đăng nhập"
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập email"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu {!editingDoctor && '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={editingDoctor ? 'Để trống nếu không đổi mật khẩu' : 'Nhập mật khẩu (tối thiểu 6 ký tự)'}
                  />
                  {formErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chuyên khoa *
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.specialization ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập chuyên khoa"
                  />
                  {formErrors.specialization && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.specialization}</p>
                  )}
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trình độ *
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.qualification ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập trình độ"
                  />
                  {formErrors.qualification && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.qualification}</p>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kinh nghiệm (năm) *
                  </label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập số năm kinh nghiệm"
                  />
                  {formErrors.experience && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.experience}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiểu sử
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập tiểu sử bác sĩ"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/admin/doctors')}
                  disabled={submitting}
                  style={{ borderRadius: '0.5rem', minHeight: '44px', height: '44px', margin: 0 }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#ffffff', borderWidth: '2px', borderRadius: '0.5rem', minHeight: '44px', height: '44px', margin: 0 }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#15803d'; e.target.style.borderColor = '#15803d'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#16a34a'; e.target.style.borderColor = '#16a34a'; }}
                  className="flex-1 px-4 py-2.5 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {submitting ? (editingDoctor ? 'Đang cập nhật...' : 'Đang tạo...') : (editingDoctor ? 'Cập nhật' : 'Tạo mới')}
                </button>
              </div>
            </form>
          </div>
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
                            onClick={() => handleView(doctor)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Xem chi tiết"
                          >
                            <i data-feather="eye" className="w-4 h-4"></i>
                          </button>
                          <button
                            onClick={() => handleEdit(doctor)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <i data-feather="edit-2" className="w-4 h-4"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(doctor)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Xóa"
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

