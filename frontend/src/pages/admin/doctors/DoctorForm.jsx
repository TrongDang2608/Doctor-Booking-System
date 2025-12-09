import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminService } from '../../../services/adminService';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFeatherIcons from '../../../hooks/useFeatherIcons';

const DoctorForm = () => {
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
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    address: '',
    bio: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      loadDoctor();
    }
  }, [id]);

  useFeatherIcons([]);

  const loadDoctor = async () => {
    try {
      const doctor = await adminService.getDoctorById(id);
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
    } catch (err) {
      setError('Không thể tải thông tin bác sĩ');
      console.error(err);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username?.trim()) {
      errors.username = 'Tên đăng nhập không được để trống';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Định dạng email không hợp lệ';
    }

    if (!isEdit && !formData.password?.trim()) {
      errors.password = 'Mật khẩu không được để trống';
    } else if (!isEdit && formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.fullName?.trim()) {
      errors.fullName = 'Họ và tên không được để trống';
    }

    if (!formData.specialization?.trim()) {
      errors.specialization = 'Chuyên khoa không được để trống';
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
    setError('');
    setFormErrors({});

    try {
      if (isEdit) {
        // Update
        const updateData = {
          username: formData.username?.trim(),
          email: formData.email?.trim(),
          fullName: formData.fullName?.trim(),
          specialization: formData.specialization?.trim(),
          qualification: formData.qualification?.trim() || '',
          experience: parseInt(formData.experience) || 0,
          phone: formData.phone?.trim() || '',
          address: formData.address?.trim() || '',
          bio: formData.bio?.trim() || '',
        };
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password.trim();
        } else {
          updateData.password = 'current_password_unchanged';
        }
        await adminService.updateDoctor(id, updateData);
        toast.success('Cập nhật bác sĩ thành công!', { position: 'top-right', autoClose: 3000 });
        setTimeout(() => navigate('/admin/doctors'), 500);
      } else {
        // Create
        const createData = {
          username: formData.username?.trim(),
          email: formData.email?.trim(),
          password: formData.password?.trim(),
          fullName: formData.fullName?.trim(),
          specialization: formData.specialization?.trim(),
          qualification: formData.qualification?.trim() || '',
          experience: parseInt(formData.experience) || 0,
          phone: formData.phone?.trim() || '',
          address: formData.address?.trim() || '',
          bio: formData.bio?.trim() || ''
        };
        await adminService.createDoctor(createData);
        toast.success('Tạo bác sĩ thành công!', { position: 'top-right', autoClose: 3000 });
        setTimeout(() => navigate('/admin/doctors'), 500);
      }

      setError('');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : `Không thể ${isEdit ? 'cập nhật' : 'tạo'} bác sĩ`;
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Chỉnh Sửa Bác Sĩ' : 'Tạo Bác Sĩ Mới'}
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

              {/* Password */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={isEdit ? 'Để trống nếu không đổi mật khẩu' : 'Nhập mật khẩu (tối thiểu 6 ký tự)'}
                />
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
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

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên khoa <span className="text-red-500">*</span>
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
                  Trình độ
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nhập trình độ"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kinh nghiệm (năm)
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nhập số năm kinh nghiệm"
                />
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

export default DoctorForm;
