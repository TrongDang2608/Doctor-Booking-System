import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminService } from '../../../services/adminService';
import Loading from '../../../components/common/Loading';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { formatDate } from '../../../utils/formatDate';
import { formatTime } from '../../../utils/formatTime';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const AppointmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  useEffect(() => {
    feather.replace();
  }, [appointment, showDeleteModal]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAppointmentById(id);
      setAppointment(data);
      setError('');
    } catch (err) {
      setError('Không thể tải thông tin lịch hẹn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/appointments/${id}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminService.deleteAppointment(id);
      toast.success('Xóa lịch hẹn thành công!', { position: 'top-right', autoClose: 3000 });
      setTimeout(() => navigate('/admin/appointments'), 500);
    } catch (err) {
      const errorMsg = 'Không thể xóa lịch hẹn';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': 'Đang chờ',
      'CONFIRMED': 'Đã xác nhận',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'CONFIRMED': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  if (!appointment) {
    return (
      <AdminLayout>
        <ErrorMessage message="Không tìm thấy lịch hẹn" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Lịch Hẹn</h1>
            <p className="text-gray-600 mt-1">Mã lịch hẹn: #{appointment.id}</p>
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

        {/* Appointment Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i data-feather="user" className="w-5 h-5 text-indigo-600"></i>
                Thông tin bệnh nhân
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên bệnh nhân:</label>
                  <p className="text-gray-900 font-medium">{appointment.patientName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại:</label>
                  <p className="text-gray-900">{appointment.patientPhone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Doctor Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i data-feather="briefcase" className="w-5 h-5 text-indigo-600"></i>
                Thông tin bác sĩ
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên bác sĩ:</label>
                  <p className="text-gray-900 font-medium">{appointment.doctorName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Chuyên khoa:</label>
                  <p className="text-gray-900">{appointment.doctorSpecialization || '-'}</p>
                </div>
              </div>
            </div>

            {/* Appointment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i data-feather="calendar" className="w-5 h-5 text-indigo-600"></i>
                Thông tin lịch hẹn
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày hẹn:</label>
                  <p className="text-gray-900">{formatDate(appointment.appointmentDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Giờ hẹn:</label>
                  <p className="text-gray-900">{formatTime(appointment.appointmentTime)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái:</label>
                  <span className={`inline-block mt-1 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {getStatusDisplay(appointment.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i data-feather="file-text" className="w-5 h-5 text-indigo-600"></i>
                Ghi chú
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{appointment.notes || 'Không có ghi chú'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t flex items-center gap-3">
            <button
              onClick={handleEdit}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <i data-feather="edit-2" className="w-5 h-5"></i>
              Chỉnh sửa
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <i data-feather="trash-2" className="w-5 h-5"></i>
              Xóa lịch hẹn
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">Xác nhận xóa</h2>
            
            <p className="text-gray-600 text-sm mb-4 text-center">
              Hành động này không thể hoàn tác
            </p>
            
            <p className="text-gray-700 mb-6 text-center">
              Bạn có chắc chắn muốn xóa lịch hẹn <strong className="text-red-600">#{appointment.id}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </AdminLayout>
  );
};

export default AppointmentDetail;
