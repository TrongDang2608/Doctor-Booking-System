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
      <div className="space-y-8 bg-[#0a0a0a] min-h-screen py-8 px-2 md:px-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Phản Hồi Của Tôi</h1>
          <p className="text-gray-400 text-lg">Xem và chỉnh sửa các phản hồi bạn đã gửi</p>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

        {/* Feedbacks List */}
        <div className="bg-[#181f2a] border border-[#232b3b] rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8"><Loading /></div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>Bạn chưa gửi phản hồi nào</p>
            </div>
          ) : (
            <div className="divide-y divide-[#232b3b]">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="p-6 md:p-7 hover:bg-[#232b3b] transition-colors flex flex-col gap-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-100 text-lg">Bác sĩ: {feedback.doctorName}</h3>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-base">{'⭐'.repeat(feedback.rating)}</span>
                          <span className="text-xs text-gray-400">({feedback.rating}/5)</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status)} shadow-sm border border-[#232b3b]`}> {getStatusDisplay(feedback.status)} </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">Gửi lúc: {formatDate(feedback.createdAt)}</p>
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-300 mb-1">Nhận xét của bạn:</p>
                        <p className="text-base text-gray-100 bg-[#202a3c] p-4 rounded-xl border border-[#232b3b]">
                          {feedback.comment || 'Không có nhận xét'}
                        </p>
                      </div>
                      {feedback.doctorReply && (
                        <div className="bg-[#1e293b] p-4 rounded-xl mb-3 border border-[#232b3b]">
                          <p className="text-sm font-medium text-blue-300 mb-1">Phản hồi từ bác sĩ:</p>
                          <p className="text-base text-gray-100">{feedback.doctorReply}</p>
                          {feedback.doctorRepliedAt && (
                            <p className="text-xs text-gray-400 mt-1">{formatDate(feedback.doctorRepliedAt)}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 md:mt-0 md:ml-4 flex-shrink-0 flex flex-col items-end">
                      {feedback.canEdit ? (
                        <button
                          onClick={() => handleEdit(feedback)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow"
                        >
                          <i data-feather="edit-2" className="w-4 h-4"></i>
                          Chỉnh sửa
                        </button>
                      ) : (
                        <div className="text-xs text-gray-500 text-center opacity-80">
                          {feedback.doctorReply ? (
                            <p>Không thể sửa<br />(đã có phản hồi)</p>
                          ) : (
                            <p>Không thể sửa<br />(quá 24h)</p>
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

        {/* Edit Modal */}
        {showEditModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#232b3b] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#232b3b] shadow-xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-100">Chỉnh Sửa Phản Hồi</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedFeedback(null);
                    }}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <i data-feather="x" className="w-6 h-6"></i>
                  </button>
                </div>

                <div className="bg-[#181f2a] p-4 rounded-xl mb-5 border border-[#232b3b]">
                  <p className="text-sm text-gray-300 mb-1">
                    <strong>Bác sĩ:</strong> {selectedFeedback.doctorName}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong>Ngày tạo:</strong> {formatDate(selectedFeedback.createdAt)}
                  </p>
                  {selectedFeedback.canEdit && (
                    <p className="text-xs text-amber-400 mt-2">
                      ⚠️ Bạn chỉ có thể chỉnh sửa trong vòng 24 giờ và trước khi bác sĩ phản hồi
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmitEdit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Đánh giá <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditData({ ...editData, rating: star })}
                          className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${star <= editData.rating ? 'text-yellow-400' : 'text-gray-500'}`}
                        >
                          {star <= editData.rating ? '⭐' : '☆'}
                        </button>
                      ))}
                      <span className="text-sm text-gray-400 ml-2">
                        ({editData.rating}/5 sao)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Nhận xét
                    </label>
                    <textarea
                      value={editData.comment}
                      onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                      rows={5}
                      className="w-full px-3 py-2 border border-[#232b3b] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[#181f2a] text-gray-100"
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
                      className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-500 hover:bg-gray-600 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-700 text-white rounded-lg border border-transparent hover:from-green-500 hover:to-green-800 transition-colors"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Close main content wrapper */}
      </div>

      <ToastContainer />
    </PatientLayout>
  );
};

export default MyFeedbacks;
