import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const FeedbackManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'reply', 'delete'
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [replyData, setReplyData] = useState({
    replyContent: '',
    status: 'REPLIED'
  });

  useEffect(() => {
    loadAllFeedbacks();
  }, []);

  // Initialize Feather Icons
  useEffect(() => {
    feather.replace();
  }, [feedbacks, showForm, viewMode]);

  // Determine view mode based on URL
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/reply')) {
      setViewMode('reply');
      setShowForm(true);
    } else if (path.includes('/delete')) {
      setViewMode('delete');
      setShowForm(false);
    } else if (id && !path.includes('/reply') && !path.includes('/delete')) {
      setViewMode('detail');
      setShowForm(false);
    } else {
      setViewMode('list');
      setShowForm(false);
      setEditingFeedback(null);
    }
  }, [id, location.pathname]);

  // Load feedback data when viewing/editing from URL
  useEffect(() => {
    if (id && allFeedbacks.length > 0 && (viewMode === 'reply' || viewMode === 'detail' || viewMode === 'delete')) {
      const feedback = allFeedbacks.find(f => f.id === parseInt(id));
      if (feedback) {
        setEditingFeedback(feedback);
        if (viewMode === 'reply') {
          setReplyData({
            replyContent: feedback.adminReply || '',
            status: 'REPLIED'
          });
        }
      }
    }
  }, [id, allFeedbacks, viewMode]);

  const filteredFeedbacks = useMemo(() => {
    let filtered = allFeedbacks;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(feedback => 
        feedback.patientName?.toLowerCase().includes(term) ||
        feedback.comment?.toLowerCase().includes(term) ||
        feedback.doctorName?.toLowerCase().includes(term)
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(feedback => feedback.status === filterStatus);
    }

    if (filterRating) {
      filtered = filtered.filter(feedback => feedback.rating === parseInt(filterRating));
    }

    return filtered;
  }, [searchTerm, filterStatus, filterRating, allFeedbacks]);

  useEffect(() => {
    setFeedbacks(filteredFeedbacks);
  }, [filteredFeedbacks]);

  const loadAllFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllFeedbacks();
      setAllFeedbacks(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách phản hồi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (feedback) => {
    navigate(`/admin/feedbacks/${feedback.id}`);
  };

  const handleReply = (feedback) => {
    navigate(`/admin/feedbacks/${feedback.id}/reply`);
  };

  const handleDeleteClick = (feedback) => {
    navigate(`/admin/feedbacks/${feedback.id}/delete`);
  };

  const handleDeleteConfirm = async () => {
    if (!editingFeedback) return;

    try {
      await adminService.deleteFeedback(editingFeedback.id);
      toast.success('Xóa phản hồi thành công!', { position: 'top-right', autoClose: 3000 });
      setViewMode('list');
      setEditingFeedback(null);
      setShowForm(false);
      loadAllFeedbacks();
      setError('');
      navigate('/admin/feedbacks');
    } catch (err) {
      const errorMsg = 'Không thể xóa phản hồi';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const handleDeleteCancel = () => {
    setViewMode('list');
    setEditingFeedback(null);
    setShowForm(false);
    navigate('/admin/feedbacks');
  };

  const handleFormClose = () => {
    setViewMode('list');
    setShowForm(false);
    setEditingFeedback(null);
    setReplyData({ replyContent: '', status: 'REPLIED' });
    loadAllFeedbacks();
    navigate('/admin/feedbacks');
  };

  const handleMarkAsRead = async (feedbackId) => {
    try {
      await adminService.markFeedbackAsRead(feedbackId);
      toast.success('Đã đánh dấu đã đọc!', { position: 'top-right', autoClose: 2000 });
      loadAllFeedbacks();
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái', { position: 'top-right', autoClose: 3000 });
      console.error(err);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!editingFeedback || !replyData.replyContent.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi', { position: 'top-right', autoClose: 3000 });
      return;
    }

    try {
      const updateData = {
        id: editingFeedback.id,
        adminReply: replyData.replyContent,
        status: replyData.status,
        repliedAt: new Date().toISOString()
      };

      await adminService.replyFeedback(editingFeedback.id, updateData);
      toast.success('Gửi phản hồi thành công!', { position: 'top-right', autoClose: 3000 });
      handleFormClose();
    } catch (err) {
      const errorMsg = 'Không thể gửi phản hồi';
      setError(errorMsg);
      toast.error(errorMsg, { position: 'top-right', autoClose: 4000 });
      console.error(err);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': 'Chưa đọc',
      'READ': 'Đã đọc', 
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
      case 'READ':
        return 'bg-blue-100 text-blue-800';
      case 'REPLIED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmModal = () => {
    if (viewMode !== 'delete' || !editingFeedback) return null;

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
                Bạn có chắc chắn muốn xóa phản hồi này?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm"><span className="font-medium">Bệnh nhân:</span> {editingFeedback.patientName}</p>
                <p className="text-sm"><span className="font-medium">Đánh giá:</span> {'⭐'.repeat(editingFeedback.rating)} ({editingFeedback.rating}/5)</p>
                <p className="text-sm"><span className="font-medium">Nhận xét:</span> {editingFeedback.comment || '-'}</p>
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
  const FeedbackDetailModal = () => {
    if (viewMode !== 'detail' || !editingFeedback) return null;

    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Phản Hồi</h1>
            <button 
              onClick={() => {
                setViewMode('list');
                setEditingFeedback(null);
                setShowForm(false);
                navigate('/admin/feedbacks');
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
                <p className="text-lg text-gray-900">{editingFeedback.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(editingFeedback.status)}`}>
                  {getStatusDisplay(editingFeedback.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Bệnh nhân</label>
                <p className="text-lg text-gray-900">{editingFeedback.patientName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Bác sĩ</label>
                <p className="text-lg text-gray-900">{editingFeedback.doctorName || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Đánh giá</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{'⭐'.repeat(editingFeedback.rating)}</span>
                  <span className="text-lg text-gray-600">({editingFeedback.rating}/5)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
                <p className="text-lg text-gray-900">{formatDateTime(editingFeedback.createdAt)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Nhận xét của bệnh nhân</label>
                <p className="text-lg text-gray-900 whitespace-pre-wrap p-3 bg-gray-50 rounded-lg">{editingFeedback.comment || '-'}</p>
              </div>
              {editingFeedback.adminReply && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày phản hồi</label>
                    <p className="text-lg text-gray-900">{editingFeedback.repliedAt ? formatDateTime(editingFeedback.repliedAt) : '-'}</p>
                  </div>
                  <div></div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phản hồi của Admin</label>
                    <p className="text-lg text-gray-900 whitespace-pre-wrap p-3 bg-blue-50 rounded-lg">{editingFeedback.adminReply}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleReply(editingFeedback)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i data-feather="message-square" className="w-4 h-4"></i>
                {editingFeedback.adminReply ? 'Sửa phản hồi' : 'Trả lời'}
              </button>
              {editingFeedback.status === 'PENDING' && (
                <button
                  onClick={() => handleMarkAsRead(editingFeedback.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <i data-feather="check" className="w-4 h-4"></i>
                  Đánh dấu đã đọc
                </button>
              )}
              <button
                onClick={() => handleDeleteClick(editingFeedback)}
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
    return <FeedbackDetailModal />;
  }

  // If showing reply form
  if (showForm || viewMode === 'reply') {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {editingFeedback?.adminReply ? 'Chỉnh Sửa Phản Hồi' : 'Trả Lời Phản Hồi'}
              </h1>
              <p className="text-gray-600 mt-1">Gửi phản hồi cho bệnh nhân</p>
            </div>
            <button 
              onClick={() => {
                setViewMode('list');
                setEditingFeedback(null);
                setShowForm(false);
                navigate('/admin/feedbacks');
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

          {/* Reply Form */}
          <div className="bg-white rounded-lg shadow p-6">
            {editingFeedback && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin phản hồi gốc:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Bệnh nhân:</span>
                    <p className="text-gray-900">{editingFeedback.patientName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Đánh giá:</span>
                    <div className="flex items-center gap-2">
                      <span>{'⭐'.repeat(editingFeedback.rating)}</span>
                      <span className="text-gray-600">({editingFeedback.rating}/5)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Nhận xét:</span>
                  <p className="text-gray-900 mt-1">{editingFeedback.comment || 'Không có nhận xét'}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleReplySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung phản hồi <span className="text-red-500">*</span></label>
                <textarea
                  value={replyData.replyContent}
                  onChange={(e) => setReplyData({...replyData, replyContent: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập nội dung phản hồi cho bệnh nhân..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái sau khi phản hồi</label>
                <select
                  value={replyData.status}
                  onChange={(e) => setReplyData({...replyData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="REPLIED">Đã phản hồi</option>
                  <option value="read">Đã đọc</option>
                </select>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <i data-feather="send" className="w-4 h-4"></i>
                  {editingFeedback?.adminReply ? 'Cập nhật phản hồi' : 'Gửi phản hồi'}
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
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Phản Hồi</h1>
            <p className="text-gray-600 mt-1">Tổng số {feedbacks.length} phản hồi</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <i data-feather="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></i>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên bệnh nhân, nhận xét..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chưa đọc</option>
                <option value="read">Đã đọc</option>
                <option value="REPLIED">Đã phản hồi</option>
              </select>
            </div>
            <div>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Tất cả đánh giá</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                <option value="3">⭐⭐⭐ (3 sao)</option>
                <option value="2">⭐⭐ (2 sao)</option>
                <option value="1">⭐ (1 sao)</option>
              </select>
            </div>
          </div>
          {(searchTerm || filterStatus || filterRating) && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {searchTerm && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Tìm kiếm: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-2">×</button>
                </span>
              )}
              {filterStatus && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Trạng thái: {getStatusDisplay(filterStatus)}
                  <button onClick={() => setFilterStatus('')} className="ml-2">×</button>
                </span>
              )}
              {filterRating && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Đánh giá: {'⭐'.repeat(parseInt(filterRating))} sao
                  <button onClick={() => setFilterRating('')} className="ml-2">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Feedbacks Table */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhận xét</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feedbacks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        {searchTerm || filterStatus || filterRating ? 'Không tìm thấy phản hồi phù hợp' : 'Không có phản hồi'}
                      </td>
                    </tr>
                  ) : (
                    feedbacks.map((feedback) => (
                      <tr key={feedback.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{feedback.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{feedback.patientName}</div>
                          <div className="text-sm text-gray-500">{feedback.doctorName || 'Không có bác sĩ'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{'⭐'.repeat(feedback.rating)}</span>
                            <span className="text-xs text-gray-500">({feedback.rating}/5)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                          {feedback.comment || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                            {getStatusDisplay(feedback.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(feedback.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(feedback)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Xem chi tiết"
                            >
                              <i data-feather="eye" className="w-4 h-4"></i>
                            </button>
                            <button
                              onClick={() => handleReply(feedback)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Trả lời"
                            >
                              <i data-feather="message-square" className="w-4 h-4"></i>
                            </button>
                            {feedback.status === 'PENDING' && (
                              <button
                                onClick={() => handleMarkAsRead(feedback.id)}
                                className="text-purple-600 hover:text-purple-800 transition-colors"
                                title="Đánh dấu đã đọc"
                              >
                                <i data-feather="check" className="w-4 h-4"></i>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(feedback)}
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

export default FeedbackManagement;