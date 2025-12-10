import { useEffect, useState } from 'react';
import DoctorLayout from '../../components/doctor/DoctorLayout';
import { doctorService } from '../../services/doctorService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const DoctorFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadFeedbacks();
    loadAverageRating();
  }, [filterRating]);

  useEffect(() => {
    feather.replace();
  }, [feedbacks, selectedFeedback, showReplyModal]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      let data;
      if (filterRating) {
        data = await doctorService.getFeedbacksByRating(filterRating);
      } else {
        data = await doctorService.getFeedbacks();
      }
      setFeedbacks(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách phản hồi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAverageRating = async () => {
    try {
      const rating = await doctorService.getAverageRating();
      setAverageRating(rating || 0);
    } catch (err) {
      console.error('Cannot load average rating:', err);
    }
  };

  const handleReply = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyText(feedback.doctorReply || '');
    setIsEditingReply(!!feedback.doctorReply);
    setShowReplyModal(true);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi', { position: 'top-right' });
      return;
    }

    try {
      const replyData = { doctorReply: replyText.trim() };
      
      if (isEditingReply) {
        await doctorService.updateDoctorReply(selectedFeedback.id, replyData);
        toast.success('Cập nhật phản hồi thành công!', { position: 'top-right' });
      } else {
        await doctorService.replyToFeedback(selectedFeedback.id, replyData);
        toast.success('Gửi phản hồi thành công!', { position: 'top-right' });
      }
      
      setShowReplyModal(false);
      setSelectedFeedback(null);
      setReplyText('');
      loadFeedbacks();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể gửi phản hồi';
      toast.error(errorMsg, { position: 'top-right' });
      console.error(err);
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

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Page Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-white">Phản Hồi Của Bệnh Nhân</h1>
            <p className="text-white mt-1">Xem và trả lời phản hồi từ bệnh nhân</p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-lg shadow text-white">
            <p className="text-sm opacity-90">Đánh giá trung bình</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
              <div>
                <div className="text-2xl">{'⭐'.repeat(Math.round(averageRating))}</div>
                <p className="text-xs opacity-90">{feedbacks.length} đánh giá</p>
              </div>
            </div>
          </div>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Lọc theo đánh giá:</label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
              <option value="4">⭐⭐⭐⭐ (4 sao)</option>
              <option value="3">⭐⭐⭐ (3 sao)</option>
              <option value="2">⭐⭐ (2 sao)</option>
              <option value="1">⭐ (1 sao)</option>
            </select>
            {filterRating && (
              <button
                onClick={() => setFilterRating('')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Feedbacks List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8"><Loading /></div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {filterRating ? 'Không có phản hồi với đánh giá này' : 'Chưa có phản hồi nào'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{feedback.patientName}</h3>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">{'⭐'.repeat(feedback.rating)}</span>
                          <span className="text-xs text-gray-500">({feedback.rating}/5)</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                          {getStatusDisplay(feedback.status)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">
                        {formatDate(feedback.createdAt)}
                      </p>
                      
                      <p className="text-gray-700 mb-3">
                        {feedback.comment || 'Không có nhận xét'}
                      </p>
                      
                      {feedback.doctorReply && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Phản hồi của bạn:</p>
                          <p className="text-sm text-gray-700">{feedback.doctorReply}</p>
                          {feedback.doctorRepliedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(feedback.doctorRepliedAt)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {feedback.canEdit || !feedback.doctorReply ? (
                        <button
                          onClick={() => handleReply(feedback)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <i data-feather={feedback.doctorReply ? "edit-2" : "message-square"} className="w-4 h-4"></i>
                          {feedback.doctorReply ? 'Sửa' : 'Trả lời'}
                        </button>
                      ) : (
                        <p className="text-xs text-gray-500 text-center">
                          Không thể chỉnh sửa<br/>(sau 24h)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditingReply ? 'Chỉnh Sửa Phản Hồi' : 'Trả Lời Phản Hồi'}
                </h2>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedFeedback(null);
                    setReplyText('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i data-feather="x" className="w-6 h-6"></i>
                </button>
              </div>

              {/* Original Feedback */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Phản hồi gốc:</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-black">{selectedFeedback.patientName}</span>
                  <span className="text-yellow-500">{'⭐'.repeat(selectedFeedback.rating)}</span>
                </div>
                <p className="text-gray-700">{selectedFeedback.comment || 'Không có nhận xét'}</p>
                <p className="text-xs text-gray-500 mt-2">{formatDate(selectedFeedback.createdAt)}</p>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung phản hồi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300` rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Nhập phản hồi của bạn cho bệnh nhân..."
                    required
                  />
                  {isEditingReply && selectedFeedback.canEdit && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Bạn chỉ có thể chỉnh sửa trong vòng 24 giờ sau khi gửi phản hồi
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyModal(false);
                      setSelectedFeedback(null);
                      setReplyText('');
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      height: '49.6px',
                      background: 'white',
                      border: '1px solid #333',
                      color: '#333',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      height: '49.6px',
                      margin: 0,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: '1px solid transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isEditingReply ? 'Cập nhật' : 'Gửi phản hồi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </DoctorLayout>
  );
};

export default DoctorFeedbacks;
