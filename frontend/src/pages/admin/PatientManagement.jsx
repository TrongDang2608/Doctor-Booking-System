import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const PatientManagement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [allPatients, setAllPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadAllPatients();
  }, []);

  // Initialize Feather Icons
  useEffect(() => {
    feather.replace();
  }, [patients, showForm]);

  // Load patient data when editing from URL
  useEffect(() => {
    if (id && allPatients.length > 0) {
      const patient = allPatients.find(p => p.id === parseInt(id));
      if (patient) {
        setEditingPatient(patient);
        setFormData({
          fullName: patient.fullName,
          email: patient.email,
          dateOfBirth: patient.dateOfBirth || '',
          gender: patient.gender || 'MALE',
          phone: patient.phone || '',
          address: patient.address || '',
          emergencyContact: patient.emergencyContact || '',
          emergencyPhone: patient.emergencyPhone || ''
        });
        setFormErrors({});
        setShowForm(true);
      }
    } else if (!id) {
      setShowForm(false);
      setEditingPatient(null);
    }
  }, [id, allPatients]);

  const filteredPatients = useMemo(() => {
    let filtered = allPatients;

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.fullName?.toLowerCase().includes(term) ||
        patient.email?.toLowerCase().includes(term) ||
        patient.phone?.includes(term)
      );
    }

    // Filter by gender
    if (filterGender !== 'ALL') {
      filtered = filtered.filter(patient => patient.gender === filterGender);
    }

    return filtered;
  }, [searchTerm, filterGender, allPatients]);

  useEffect(() => {
    setPatients(filteredPatients);
    // Replace Feather Icons after patients update
    if (window.feather) {
      setTimeout(() => window.feather.replace(), 100);
    }
  }, [filteredPatients]);

  const loadAllPatients = async () => {
    try {
      setLoading(true);
      const data = await adminService.searchPatients('');
      setAllPatients(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách bệnh nhân');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPatient(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      dateOfBirth: '',
      gender: 'MALE',
      phone: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: ''
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleEdit = (patient) => {
    navigate(`/admin/patients/edit/${patient.id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bệnh nhân này? Hành động này cũng sẽ xóa tài khoản người dùng của họ.')) {
      return;
    }

    try {
      await adminService.deletePatient(id);
      toast.success('Xóa bệnh nhân thành công!', { position: 'top-right', autoClose: 3000 });
      loadAllPatients();
      setError('');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : 'Không thể xóa bệnh nhân';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!editingPatient) {
      if (!formData.username?.trim()) {
        errors.username = 'Tên đăng nhập không được để trống';
      } else if (formData.username.length < 3) {
        errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
      }

      if (!formData.password) {
        errors.password = 'Mật khẩu không được để trống';
      } else if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }

    if (!formData.fullName?.trim()) {
      errors.fullName = 'Họ và tên không được để trống';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Định dạng email không hợp lệ';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      if (editingPatient) {
        // Update patient
        await adminService.updatePatient(editingPatient.id, {
          fullName: formData.fullName,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender,
          phone: formData.phone,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone
        });
        toast.success('Cập nhật bệnh nhân thành công!', { position: 'top-right', autoClose: 3000 });
      } else {
        // Create new patient
        await adminService.createPatient(formData);
        toast.success('Tạo bệnh nhân thành công!', { position: 'top-right', autoClose: 3000 });
      }

      setShowForm(false);
      navigate('/admin/patients');
      loadAllPatients();
      setError('');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : `Không thể ${editingPatient ? 'cập nhật' : 'tạo'} bệnh nhân`;
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && patients.length === 0 && !id) {
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
                {editingPatient ? 'Chỉnh Sửa Bệnh Nhân' : 'Tạo Bệnh Nhân Mới'}
              </h1>
              <p className="text-gray-600 mt-1">Cập nhật thông tin bệnh nhân</p>
            </div>
            <button 
              onClick={() => navigate('/admin/patients')} 
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

          {/* Patient Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username (only for create) */}
                {!editingPatient && (
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
                )}

                {/* Password (only for create) */}
                {!editingPatient && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                    )}
                  </div>
                )}

                {/* Full Name */}
                <div className={!editingPatient ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và Tên *
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

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập địa chỉ"
                    rows="2"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người liên hệ khẩn cấp
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập tên người liên hệ"
                  />
                </div>

                {/* Emergency Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SĐT người liên hệ khẩn cấp
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại khẩn cấp"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/admin/patients')}
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
                  {submitting ? (editingPatient ? 'Đang cập nhật...' : 'Đang tạo...') : (editingPatient ? 'Cập nhật' : 'Tạo mới')}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {showForm ? (editingPatient ? 'Chỉnh Sửa Bệnh Nhân' : 'Tạo Bệnh Nhân Mới') : 'Quản Lý Bệnh Nhân'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {showForm ? 'Cập nhật thông tin bệnh nhân' : `Tổng số ${patients.length} bệnh nhân`}
            </p>
          </div>
          {!showForm && (
            <button 
              onClick={handleCreate} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <i data-feather="user-plus" className="w-5 h-5"></i>
              Thêm Bệnh Nhân Mới
            </button>
          )}
          {showForm && (
            <button 
              onClick={() => navigate('/admin/patients')} 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <i data-feather="arrow-left" className="w-5 h-5"></i>
              Quay lại danh sách
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={() => setError('')} 
          />
        )}

        {/* Show Form or List based on showForm state */}
        {showForm ? (
          /* This section is already rendered above in the early return */
          null
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <i data-feather="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></i>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Gender Filter */}
                <div className="relative">
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="ALL">Tất cả giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                  <i data-feather="chevron-down" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"></i>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchTerm || filterGender !== 'ALL') && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      Tìm kiếm: "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                        <i data-feather="x" className="w-3 h-3"></i>
                      </button>
                    </span>
                  )}
                  {filterGender !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                      Giới tính: {filterGender === 'MALE' ? 'Nam' : filterGender === 'FEMALE' ? 'Nữ' : 'Khác'}
                      <button onClick={() => setFilterGender('ALL')} className="hover:text-purple-900">
                        <i data-feather="x" className="w-3 h-3"></i>
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterGender('ALL');
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Điện Thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giới Tính</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Sinh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy bệnh nhân
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.gender === 'MALE' ? 'bg-blue-100 text-blue-700' :
                          patient.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {patient.gender || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <i data-feather="edit-2" className="w-4 h-4"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
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
          </>
        )}
      </div>
      <ToastContainer />
    </AdminLayout>
  );
};

export default PatientManagement;
