import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminService } from '../../../services/adminService';
import Loading from '../../../components/common/Loading';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { formatDate } from '../../../utils/formatDate';
import { formatTime } from '../../../utils/formatTime';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFeatherIcons from '../../../hooks/useFeatherIcons';

const AppointmentList = () => {
  const navigate = useNavigate();
  const [allAppointments, setAllAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadAllAppointments();
  }, []);

  // Initialize Feather Icons
  useFeatherIcons([appointments, currentPage]);

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
    setCurrentPage(1);
  }, [filteredAppointments]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(appointments.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ‹
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="px-2">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 border rounded-lg ${
            currentPage === i
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="px-2">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ›
      </button>
    );

    return pages;
  };

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

        {/* Error Alert */}
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={() => setError('')} 
          />
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <i data-feather="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></i>
              <input
                type="text"
                placeholder="Tìm kiếm theo bệnh nhân, bác sĩ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Đang chờ</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
              <i data-feather="chevron-down" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none"></i>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || filterDate || filterStatus) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Tìm kiếm: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-blue-900 font-bold">×</button>
                </span>
              )}
              {filterDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Ngày: {formatDate(filterDate)}
                  <button onClick={() => setFilterDate('')} className="hover:text-green-900 font-bold">×</button>
                </span>
              )}
              {filterStatus && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  Trạng thái: {getStatusDisplay(filterStatus)}
                  <button onClick={() => setFilterStatus('')} className="hover:text-yellow-900 font-bold">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm || filterDate || filterStatus ? 'Không tìm thấy lịch hẹn phù hợp' : 'Không có lịch hẹn'}
                    </td>
                  </tr>
                ) : (
                  currentAppointments.map((appointment) => (
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
                        <div className="flex items-center justify-center gap-2">
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, appointments.length)} của {appointments.length} lịch hẹn
              </div>
              <div className="flex items-center gap-2">
                {renderPagination()}
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </AdminLayout>
  );
};

export default AppointmentList;
