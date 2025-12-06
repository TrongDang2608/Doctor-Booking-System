import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const AppointmentManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [allAppointments, setAllAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'edit', 'delete'
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    appointmentDate: '',
    appointmentTime: ''
  });

  useEffect(() => {
    loadAllAppointments();
  }, []);

  // Initialize Feather Icons
  useEffect(() => {
    feather.replace();
  }, [appointments, showForm, viewMode]);

  // Determine view mode based on URL
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/edit')) {
      setViewMode('edit');
      setShowForm(true);
    } else if (path.includes('/delete')) {
      setViewMode('delete');
      setShowForm(false);
    } else if (id && !path.includes('/edit') && !path.includes('/delete')) {
      setViewMode('detail');
      setShowForm(false);
    } else {
      setShowForm(false);
      setEditingAppointment(null);
    }
  }, [id, location.pathname]);

  // Load appointment data when viewing/editing from URL
  useEffect(() => {
    if (id && allAppointments.length > 0 && (viewMode === 'edit' || viewMode === 'detail' || viewMode === 'delete')) {
      const appointment = allAppointments.find(a => a.id === parseInt(id));
      if (appointment) {
        setEditingAppointment(appointment);
        if (viewMode === 'edit') {
          setFormData({
            status: appointment.status || '',
            notes: appointment.notes || '',
            appointmentDate: appointment.appointmentDate || '',
            appointmentTime: appointment.appointmentTime || ''
          });
        }
      }
    }
  }, [id, allAppointments, viewMode]);

  const filteredAppointments = useMemo(() => {
    let filtered = allAppointments;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.patientName?.toLowerCase().includes(term) ||
        appointment.doctorName?.toLowerCase().includes(term) ||
        appointment.notes?.toLowerCase().includes(term)
      );
    }

    if (filterDate) {
      filtered = filtered.filter(appointment => 
        appointment.appointmentDate === filterDate
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(appointment => 
        appointment.status === filterStatus
      );
    }

    return filtered;
  }, [searchTerm, filterDate, filterStatus, allAppointments]);

  useEffect(() => {
    setAppointments(filteredAppointments);
  }, [filteredAppointments]);

  const loadAllAppointments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAppointments();
      setAllAppointments(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách lịch hẹn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (appointment) => {
    navigate(`/admin/appointments/${appointment.id}`);
  };

  const handleEdit = (appointment) => {
    navigate(`/admin/appointments/${appointment.id}/edit`);
  };

  const handleDeleteClick = (appointment) => {
    navigate(`/admin/appointments/${appointment.id}/delete`);
  };

  const handleDeleteConfirm = async () => {
    if (!editingAppointment) return;

    try {
      await adminService.deleteAppointment(editingAppointment.id);
      toast.success('Xóa lịch hẹn thành công!', { position: 'top-right', autoClose: 3000 });
      setViewMode('list');
      setEditingAppointment(null);
      setShowForm(false);
      loadAllAppointments();
      setError('');
      navigate('/admin/appointments');
    } catch (err) {
      const errorMsg = 'Không thể xóa lịch hẹn';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const handleDeleteCancel = () => {
    setViewMode('list');
    setEditingAppointment(null);
    setShowForm(false);
    navigate('/admin/appointments');
  };

  const handleFormClose = () => {
    setViewMode('list');
    setShowForm(false);
    setEditingAppointment(null);
    setFormData({ status: '', notes: '', appointmentDate: '', appointmentTime: '' });
    loadAllAppointments();
    navigate('/admin/appointments');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingAppointment) return;

    try {
      const updateData = {
        id: editingAppointment.id,
        status: formData.status,
        notes: formData.notes,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime
      };

      await adminService.updateAppointment(editingAppointment.id, updateData);
      toast.success('Cập nhật lịch hẹn thành công!', { position: 'top-right', autoClose: 3000 });
      handleFormClose();
    } catch (err) {
      const errorMsg = 'Không thể cập nhật lịch hẹn';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
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
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmModal = () => {
    if (viewMode !== 'delete' || !editingAppointment) return null;

    return (
      <AdminLayout>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i data-feather="alert-triangle" className="w-6 h-6 text-red-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Bạn có chắc chắn muốn xóa lịch hẹn này?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm"><span className="font-medium">Bệnh nhân:</span> {editingAppointment.patientName}</p>
                <p className="text-sm"><span className="font-medium">Bác sĩ:</span> {editingAppointment.doctorName}</p>
                <p className="text-sm"><span className="font-medium">Ngày:</span> {formatDate(editingAppointment.appointmentDate)}</p>
                <p className="text-sm"><span className="font-medium">Giờ:</span> {formatTime(editingAppointment.appointmentTime)}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  };

  // Detail View Modal Component
  const AppointmentDetailModal = () => {
    if (viewMode !== 'detail' || !editingAppointment) return null;

    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Lịch Hẹn</h1>
            <button 
              onClick={() => {
                setViewMode('list');
                setEditingAppointment(null);
                setShowForm(false);
                navigate('/admin/appointments');
              }} 
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
                <p className="text-lg text-gray-900">{editingAppointment.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(editingAppointment.status)}`}>
                  {getStatusDisplay(editingAppointment.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Bệnh nhân</label>
                <p className="text-lg text-gray-900">{editingAppointment.patientName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại bệnh nhân</label>
                <p className="text-lg text-gray-900">{editingAppointment.patientPhone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Bác sĩ</label>
                <p className="text-lg text-gray-900">{editingAppointment.doctorName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Chuyên khoa</label>
                <p className="text-lg text-gray-900">{editingAppointment.doctorSpecialization || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ngày hẹn</label>
                <p className="text-lg text-gray-900">{formatDate(editingAppointment.appointmentDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Giờ hẹn</label>
                <p className="text-lg text-gray-900">{formatTime(editingAppointment.appointmentTime)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Ghi chú</label>
                <p className="text-lg text-gray-900 whitespace-pre-wrap">{editingAppointment.notes || '-'}</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleEdit(editingAppointment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i data-feather="edit-2" className="w-4 h-4"></i>
                Chỉnh sửa
              </button>
              <button
                onClick={() => handleDeleteClick(editingAppointment)}
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

  // If showing delete modal
  if (viewMode === 'delete') {
    return <DeleteConfirmModal />;
  }

  // If showing detail view
  if (viewMode === 'detail') {
    return <AppointmentDetailModal />;
  }

  // If showing edit form
  if (showForm || viewMode === 'edit') {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chỉnh Sửa Lịch Hẹn</h1>
              <p className="text-gray-600 mt-1">Cập nhật thông tin lịch hẹn</p>
            </div>
            <button 
              onClick={() => {
                setViewMode('list');
                setEditingAppointment(null);
                setShowForm(false);
                navigate('/admin/appointments');
              }} 
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

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {editingAppointment && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Bệnh nhân</label>
                    <p className="text-lg text-gray-900">{editingAppointment.patientName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Bác sĩ</label>
                    <p className="text-lg text-gray-900">{editingAppointment.doctorName}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hẹn</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giờ hẹn</label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="PENDING">Đang chờ</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập ghi chú cho lịch hẹn..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleFormClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cập nhật
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
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lịch Hẹn</h1>
            <p className="text-gray-600 mt-1">Tổng số {appointments.length} lịch hẹn</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={() => setError('')} 
              className="text-red-800 hover:text-red-900 font-bold text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <i data-feather="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></i>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Lọc theo ngày"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Đang chờ</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>
          {(searchTerm || filterDate || filterStatus) && (
            <div className="mt-3 flex gap-2">
              {searchTerm && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Tìm kiếm: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-2">×</button>
                </span>
              )}
              {filterDate && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Ngày: {formatDate(filterDate)}
                  <button onClick={() => setFilterDate('')} className="ml-2">×</button>
                </span>
              )}
              {filterStatus && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Trạng thái: {getStatusDisplay(filterStatus)}
                  <button onClick={() => setFilterStatus('')} className="ml-2">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8">
              <Loading />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bác sĩ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        {searchTerm || filterDate || filterStatus ? 'Không tìm thấy lịch hẹn phù hợp' : 'Không có lịch hẹn'}
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                          <div className="text-sm text-gray-500">{appointment.patientPhone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                          <div className="text-sm text-gray-500">{appointment.doctorSpecialization}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(appointment.appointmentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(appointment.appointmentTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusDisplay(appointment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(appointment)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Xem chi tiết"
                            >
                              <i data-feather="eye" className="w-4 h-4"></i>
                            </button>
                            <button
                              onClick={() => handleEdit(appointment)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <i data-feather="edit-2" className="w-4 h-4"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(appointment)}
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
          )}
        </div>
      </div>
      <ToastContainer />
    </AdminLayout>
  );
};

export default AppointmentManagement;