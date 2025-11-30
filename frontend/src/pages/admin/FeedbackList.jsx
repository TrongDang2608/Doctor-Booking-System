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
      <div className="admin-page">
        <h1 className="page-title">Feedback Management</h1>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <div className="filter-container">
          <label className="filter-label">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="READ">Read</option>
          </select>
        </div>

        {feedbacks.length === 0 ? (
          <div className="empty-state">
            <p>No feedbacks found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((feedback) => (
                  <tr key={feedback.id}>
                    <td style={{ color: '#e0e0e0' }}>{feedback.patientName}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{'⭐'.repeat(feedback.rating)}</span>
                        <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>({feedback.rating}/5)</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px', color: '#94A3B8' }}>
                      {feedback.comment || '-'}
                    </td>
                    <td>
                      <span className="status-badge" style={{
                        backgroundColor: feedback.status === 'READ' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: feedback.status === 'READ' ? '#10B981' : '#F59E0B',
                      }}>
                        {feedback.status}
                      </span>
                    </td>
                    <td style={{ color: '#94A3B8' }}>{formatDate(feedback.createdAt)}</td>
                    <td className="actions-cell">
                      {feedback.status === 'PENDING' && (
                        <button
                          onClick={() => handleMarkAsRead(feedback.id)}
                          className="btn-mark-read"
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
        )}
      </div>
    </AdminLayout>
  );
};

export default FeedbackList;

