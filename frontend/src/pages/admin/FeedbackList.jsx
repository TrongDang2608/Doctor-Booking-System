import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import './adminPages.css';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadFeedbacks();
  }, [filterStatus]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllFeedbacks(filterStatus || null);
      setFeedbacks(data);
      setError('');
    } catch (err) {
      setError('Failed to load feedbacks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await adminService.markFeedbackAsRead(id);
      loadFeedbacks();
      setError('');
    } catch (err) {
      setError('Failed to mark feedback as read');
      console.error(err);
    }
  };

  if (loading && feedbacks.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>

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

        {/* Filter Section */}
        <div className="flex items-center gap-3">
          <label className="font-semibold text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="READ">Read</option>
          </select>
        </div>

        {/* Feedback Table */}
        {feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
            <span className="text-6xl mb-4">📭</span>
            <p className="text-gray-500 text-lg">No feedbacks found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Comment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {feedbacks.map((feedback) => (
                    <tr key={feedback.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {feedback.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{'⭐'.repeat(feedback.rating)}</span>
                          <span className="text-xs text-gray-500 font-medium">({feedback.rating}/5)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {feedback.comment || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          feedback.status === 'PENDING' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {feedback.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(feedback.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feedback.status === 'PENDING' && (
                          <button
                            onClick={() => handleMarkAsRead(feedback.id)}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                          >
                            Mark as Read
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FeedbackList;

