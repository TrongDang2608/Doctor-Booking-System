import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const FeedbackManagement = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  useEffect(() => {
    feather.replace();
  }, [feedbacks, selectedFeedback]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllFeedbacks();
      setFeedbacks(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách phản hồi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (feedback) => {
    try {
      const data = await adminService.getFeedbackById(feedback.id);
      setSelectedFeedback(data);
      setShowDetailModal(true);
    } catch (err) {
      toast.error('Không thể tải chi tiết phản hồi', { position: 'top-right' });
    }
  };

  const handleHide = async (feedback) => {
    try {
      await adminService.hideFeedback(feedback.id);
      toast.success('Đã ẩn phản hồi!', { position: 'top-right', autoClose: 2000 });
      loadFeedbacks();
    } catch (err) {
      toast.error('Không thể ẩn phản hồi', { position: 'top-right' });
    }
  };

  const handleUnhide = async (feedback) => {
    try {
      await adminService.unhideFeedback(feedback.id);
      toast.success('Đã bỏ ẩn phản hồi!', { position: 'top-right', autoClose: 2000 });
      loadFeedbacks();
    } catch (err) {
      toast.error('Không thể bỏ ẩn phản hồi', { position: 'top-right' });
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': 'Chưa đọc',
      'READ': 'Đã đọc',
      'REPLIED': 'Đã phản hồi'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'READ':
        return 'bg-blue-100 text-blue-800';
      case 'REPLIED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchSearch = !searchTerm || 
      feedback.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = !filterStatus || feedback.status === filterStatus;
    const matchRating = !filterRating || feedback.rating === parseInt(filterRating);
    
    return matchSearch && matchStatus && matchRating;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Phản Hồi</h1>
            <p className="text-gray-600 mt-1">Xem và quản lý phản hồi từ bệnh nhân</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow">
            <p className="text-sm text-gray-600">Tổng số phản hồi</p>
            <p className="text-2xl font-bold text-blue-600">{feedbacks.length}</p>
          </div>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo bệnh nhân, bác sĩ, nhận xét..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="PENDING">Chưa đọc</option>
                <option value="READ">Đã đọc</option>
                <option value="REPLIED">Đã phản hồi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                <option value="3">⭐⭐⭐ (3 sao)</option>
                <option value="2">⭐⭐ (2 sao)</option>
                <option value="1">⭐ (1 sao)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedbacks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8"><Loading /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bệnh nhân</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bác sĩ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhận xét</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFeedbacks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        Không tìm thấy phản hồi
                      </td>
                    </tr>
                  ) : (
                    filteredFeedbacks.map((feedback) => (
                      <tr key={feedback.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{feedback.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{feedback.patientName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{feedback.doctorName || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span>{'⭐'.repeat(feedback.rating)}</span>
                            <span className="text-xs text-gray-500">({feedback.rating})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                          {feedback.comment || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                              {getStatusDisplay(feedback.status)}
                            </span>
                            {feedback.isHidden && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Đã ẩn
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(feedback.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(feedback)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Xem chi tiết"
                            >
                              <i data-feather="eye" className="w-4 h-4"></i>
                            </button>
                            {feedback.isHidden ? (
                              <button
                                onClick={() => handleUnhide(feedback)}
                                className="text-green-600 hover:text-green-800"
                                title="Bỏ ẩn"
                              >
                                <i data-feather="eye" className="w-4 h-4"></i>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleHide(feedback)}
                                className="text-red-600 hover:text-red-800"
                                title="Ẩn phản hồi"
                              >
                                <i data-feather="eye-off" className="w-4 h-4"></i>
                              </button>
                            )}
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

      {/* Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Phản Hồi</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i data-feather="x" className="w-6 h-6"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID</label>
                    <p className="text-gray-900">{selectedFeedback.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                      {getStatusDisplay(selectedFeedback.status)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bệnh nhân</label>
                    <p className="text-gray-900">{selectedFeedback.patientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bác sĩ</label>
                    <p className="text-gray-900">{selectedFeedback.doctorName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Đánh giá</label>
                    <div className="flex items-center gap-2">
                      <span>{'⭐'.repeat(selectedFeedback.rating)}</span>
                      <span className="text-gray-600">({selectedFeedback.rating}/5)</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                    <p className="text-gray-900">{formatDate(selectedFeedback.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Nhận xét của bệnh nhân</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                    {selectedFeedback.comment || 'Không có nhận xét'}
                  </p>
                </div>

                {selectedFeedback.doctorReply && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phản hồi của bác sĩ</label>
                    <p className="text-gray-900 bg-blue-50 p-3 rounded-lg mt-1">
                      {selectedFeedback.doctorReply}
                    </p>
                    {selectedFeedback.doctorRepliedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Phản hồi lúc: {formatDate(selectedFeedback.doctorRepliedAt)}
                      </p>
                    )}
                  </div>
                )}

                {selectedFeedback.isHidden && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-red-800 text-sm font-medium">⚠️ Phản hồi này đã bị ẩn</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {selectedFeedback.isHidden ? (
                  <button
                    onClick={() => {
                      handleUnhide(selectedFeedback);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Bỏ ẩn
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleHide(selectedFeedback);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Ẩn phản hồi
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </AdminLayout>
  );
};

export default FeedbackManagement;
