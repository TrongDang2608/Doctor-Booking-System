import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminService } from '../../../services/adminService';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFeatherIcons from '../../../hooks/useFeatherIcons';

const PatientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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
    if (isEdit) {
      loadPatient();
    }
  }, [id]);

  // Initialize Feather Icons safely using custom hook
  useFeatherIcons([formData]);

  const loadPatient = async () => {
    try {
      const patient = await adminService.getPatientById(id);
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
    } catch (err) {
      setError('Không thể tải thông tin bệnh nhân');
      toast.error('Không thể tải thông tin bệnh nhân');
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!isEdit) {
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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
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
      if (isEdit) {
        await adminService.updatePatient(id, formData);
        toast.success('Cập nhật bệnh nhân thành công!', { position: 'top-right', autoClose: 3000 });
        setTimeout(() => navigate('/admin/patients'), 500);
      } else {
        await adminService.createPatient(formData);
        toast.success('Tạo bệnh nhân thành công!', { position: 'top-right', autoClose: 3000 });
        setTimeout(() => navigate('/admin/patients'), 500);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Không thể ${isEdit ? 'cập nhật' : 'tạo'} bệnh nhân`);
      toast.error(err.response?.data?.message || `Không thể ${isEdit ? 'cập nhật' : 'tạo'} bệnh nhân`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Chỉnh Sửa Bệnh Nhân' : 'Tạo Bệnh Nhân Mới'}
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
              {!isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên đăng nhập <span className="text-red-500">*</span>
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
              {!isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu <span className="text-red-500">*</span>
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
              <div className={!isEdit ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và Tên <span className="text-red-500">*</span>
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
                  Email <span className="text-red-500">*</span>
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
                {submitting ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : (isEdit ? 'Cập nhật' : 'Tạo mới')}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </AdminLayout>
  );
};

export default PatientForm;
