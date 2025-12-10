import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminService } from '../../../services/adminService';
import Loading from '../../../components/common/Loading';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    appointmentDate: '',
    appointmentTime: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadAppointment();
  }, [id]);

  useEffect(() => {
    feather.replace();
  }, []);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAppointmentById(id);
      setFormData({
        status: data.status || '',
        notes: data.notes || '',
        appointmentDate: data.appointmentDate || '',
        appointmentTime: data.appointmentTime || ''
      });
      setError('');
    } catch (err) {
      setError('Không thể tải thông tin lịch hẹn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.status) {
      errors.status = 'Vui lòng chọn trạng thái';
    }

    if (!formData.appointmentDate) {
      errors.appointmentDate = 'Ngày hẹn không được để trống';
    }

    if (!formData.appointmentTime) {
      errors.appointmentTime = 'Giờ hẹn không được để trống';
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
      const updateData = {
        id: parseInt(id),
        status: formData.status,
        notes: formData.notes.trim(),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime
      };

      await adminService.updateAppointment(id, updateData);
      toast.success('Cập nhật lịch hẹn thành công!', { position: 'top-right', autoClose: 3000 });
      setTimeout(() => navigate('/admin/appointments'), 500);
    } catch (err) {
      const errorMsg = 'Không thể cập nhật lịch hẹn';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chỉnh Sửa Lịch Hẹn</h1>
            <p className="text-gray-600 mt-1">Cập nhật thông tin lịch hẹn</p>
          </div>
          <button 
            onClick={() => navigate('/admin/appointments')} 
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

        {/* Appointment Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    formErrors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="PENDING">Đang chờ</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
                {formErrors.status && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>
                )}
              </div>

              {/* Appointment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày hẹn <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    formErrors.appointmentDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.appointmentDate && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.appointmentDate}</p>
                )}
              </div>

              {/* Appointment Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ hẹn <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    formErrors.appointmentTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.appointmentTime && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.appointmentTime}</p>
                )}
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nhập ghi chú cho lịch hẹn..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/admin/appointments')}
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
                {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </AdminLayout>
  );
};

export default AppointmentForm;
