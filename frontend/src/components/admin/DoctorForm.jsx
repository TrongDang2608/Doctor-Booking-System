import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import ErrorMessage from '../common/ErrorMessage';
import { toast } from 'react-toastify';

const DoctorForm = ({ doctor, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    specialization: '',
    qualification: '',
    experience: 0,
    phone: '',
    address: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        username: doctor.username || '',
        password: '', // Don't pre-fill password
        email: doctor.email || '',
        fullName: doctor.fullName || '',
        specialization: doctor.specialization || '',
        qualification: doctor.qualification || '',
        experience: doctor.experience || 0,
        phone: doctor.phone || '',
        address: doctor.address || '',
        bio: doctor.bio || '',
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'experience' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (doctor) {
        // For update, send all required fields
        const updateData = {
          username: formData.username, // Required field
          email: formData.email,
          fullName: formData.fullName,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: formData.experience,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
        };
        // Only include password if it's not empty, otherwise send a valid placeholder
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        } else {
          // Send a placeholder that meets validation but backend can detect as unchanged
          updateData.password = 'current_password_unchanged';
        }
        await adminService.updateDoctor(doctor.id, updateData);
        toast.success('Cập nhật bác sĩ thành công!', { position: 'top-right', autoClose: 3000 });
      } else {
        await adminService.createDoctor(formData);
        toast.success('Tạo bác sĩ thành công!', { position: 'top-right', autoClose: 3000 });
      }
      // Delay to show toast before navigating
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 300);
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || 'Không thể lưu thông tin bác sĩ';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Error Alert */}
      {error && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username - only show when creating */}
            {!doctor && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  placeholder="nguyenvana" 
                />
              </div>
            )}

            {/* Password - only show when creating, or optional when editing */}
            {!doctor ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu <span className="text-red-500">*</span></label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  placeholder="••••••••" 
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu <span className="text-gray-500 font-normal">(bỏ trống để giữ mật khẩu hiện tại)</span>
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                  placeholder="••••••••" 
                />
              </div>
            )}

            <div className={!doctor ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và Tên <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="BS. Nguyễn Văn A" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="bsnguyenvana@hospital.com" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chuyên Khoa <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="specialization" 
                value={formData.specialization} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="Tim mạch" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bằng cấp</label>
              <input 
                type="text" 
                name="qualification" 
                value={formData.qualification} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="Bác sĩ Đa khoa, Thạc sĩ" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kinh nghiệm (năm)</label>
              <input 
                type="number" 
                name="experience" 
                value={formData.experience} 
                onChange={handleChange} 
                min="0" 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="5" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
                placeholder="0912345678" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200" 
              placeholder="123 Đường Bệnh viện, Thành phố" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tiểu sư</label>
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              rows="4" 
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none" 
              placeholder="Mô tả ngắn về bác sĩ..." 
            />
          </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4 border-t mt-6">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            style={{ borderRadius: '0.5rem', minHeight: '44px', height: '44px', margin: 0 }}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#ffffff', borderWidth: '2px', borderRadius: '0.5rem', minHeight: '44px', height: '44px', margin: 0 }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#15803d'; e.target.style.borderColor = '#15803d'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#16a34a'; e.target.style.borderColor = '#16a34a'; }}
            className="flex-1 px-4 py-2.5 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Đang cập nhật...' : doctor ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;

