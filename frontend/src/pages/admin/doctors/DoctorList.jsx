import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import { adminService } from '../../../services/adminService';
import Loading from '../../../components/common/Loading';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFeatherIcons from '../../../hooks/useFeatherIcons';

const DoctorList = () => {
  const navigate = useNavigate();
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadAllDoctors();
  }, []);

  // Initialize Feather Icons
  useFeatherIcons([doctors, currentPage]);

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
    setCurrentPage(1); // Reset to page 1 when filter changes
  }, [filteredDoctors]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(doctors.length / itemsPerPage);

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

    // Previous button
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

    // First page
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

    // Page numbers
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

    // Last page
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

    // Next button
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
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
                  currentDoctors.map((doctor) => (
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
                        <div className="flex items-center justify-center gap-2">
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
                Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, doctors.length)} của {doctors.length} bác sĩ
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

export default DoctorList;
