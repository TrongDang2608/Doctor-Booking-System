import { useEffect, useState } from 'react';
import PatientLayout from '../../components/patient/PatientLayout';
import { patientService } from '../../services/patientService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import feather from 'feather-icons';

const MyFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadFeedbacks();
  }, []);

  useEffect(() => {
    feather.replace();
  }, [feedbacks, showEditModal]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await patientService.getFeedbacks();
      setFeedbacks(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách phản hồi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    setSelectedFeedback(feedback);
    setEditData({
      rating: feedback.rating,
      comment: feedback.comment || ''
    });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    try {
      await patientService.updateFeedback(selectedFeedback.id, editData);
      toast.success('Cập nhật phản hồi thành công!', { position: 'top-right' });
      setShowEditModal(false);
      setSelectedFeedback(null);
      loadFeedbacks();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể cập nhật phản hồi';
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
    <PatientLayout>
      <div className="space-y-6 bg-[#111827] min-h-screen py-8 px-2 md:px-0">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Phản Hồi Của Tôi</h1>
          <p className="text-gray-300 mt-1">Xem và chỉnh sửa các phản hồi bạn đã gửi</p>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

        {/* Feedbacks List */}
        <div className="bg-[#181f2a] border border-[#232b3b] rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8"><Loading /></div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>Bạn chưa gửi phản hồi nào</p>
              <a href="/patient/feedback/new" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                Gửi phản hồi đầu tiên →
              </a>
            </div>
          ) : (
            <div className="divide-y divide-[#232b3b]">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="p-6 hover:bg-[#232b3b] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-100">
                          Bác sĩ: {feedback.doctorName}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">{'⭐'.repeat(feedback.rating)}</span>
                          <span className="text-xs text-gray-400">({feedback.rating}/5)</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status)}`}> {getStatusDisplay(feedback.status)} </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        Gửi lúc: {formatDate(feedback.createdAt)}
                      </p>
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-300 mb-1">Nhận xét của bạn:</p>
                        <p className="text-gray-200 bg-[#232b3b] p-3 rounded-lg">
                          {feedback.comment || 'Không có nhận xét'}
                        </p>
                      </div>
                      {feedback.doctorReply && (
                        <div className="bg-[#1e293b] p-3 rounded-lg mb-3">
                          <p className="text-sm font-medium text-blue-300 mb-1">
                            Phản hồi từ bác sĩ:
                          </p>
                          <p className="text-sm text-gray-200">{feedback.doctorReply}</p>
                          {feedback.doctorRepliedAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(feedback.doctorRepliedAt)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {feedback.canEdit ? (
                        <button
                          onClick={() => handleEdit(feedback)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <i data-feather="edit-2" className="w-4 h-4"></i>
                          Chỉnh sửa
                        </button>
                      ) : (
                        <div className="text-xs text-gray-500 text-center">
                          {feedback.doctorReply ? (
                            <p>Không thể sửa<br/>(đã có phản hồi)</p>
                          ) : (
                            <p>Không thể sửa<br/>(quá 24h)</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Chỉnh Sửa Phản Hồi</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFeedback(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i data-feather="x" className="w-6 h-6"></i>
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Bác sĩ:</strong> {selectedFeedback.doctorName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Ngày tạo:</strong> {formatDate(selectedFeedback.createdAt)}
                </p>
                {selectedFeedback.canEdit && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Bạn chỉ có thể chỉnh sửa trong vòng 24 giờ và trước khi bác sĩ phản hồi
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đánh giá <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditData({ ...editData, rating: star })}
                        className="text-3xl focus:outline-none transition-transform hover:scale-110"
                      >
                        {star <= editData.rating ? '⭐' : '☆'}
                      </button>
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      ({editData.rating}/5 sao)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét
                  </label>
                  <textarea
                    value={editData.comment}
                    onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedFeedback(null);
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
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </PatientLayout>
  );
};

export default MyFeedbacks;
