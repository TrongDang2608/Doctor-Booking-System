import { useState } from 'react';

const CancelAppointmentModal = ({ appointment, onClose, onConfirm, isAdmin = false }) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const predefinedReasons = [
    'Bận công việc đột xuất',
    'Lý do sức khỏe',
    'Thay đổi lịch trình',
    'Khác'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cancellationReason.trim()) {
      setError('Vui lòng nhập lý do hủy');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onConfirm(cancellationReason);
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể hủy lịch hẹn');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '550px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#1a1a1a', fontWeight: '600', margin: 0 }}>Hủy Lịch Hẹn</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ×
          </button>
        </div>

        {appointment && (
          <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107', color: '#1a1a1a' }}>
            <div><strong>Bệnh nhân:</strong> {appointment.patientName}</div>
            <div><strong>Ngày:</strong> {appointment.appointmentDate}</div>
            <div><strong>Giờ:</strong> {appointment.appointmentTime}</div>
            {!isAdmin && (
              <div style={{ marginTop: '10px', color: '#856404', fontSize: '0.9rem' }}>
                ⚠️ Lưu ý: Bạn chỉ có thể hủy lịch hẹn trước thời gian khám tối thiểu 24 giờ.
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1a1a1a' }}>
              Chọn lý do hủy <span style={{ color: 'red' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {predefinedReasons.map((reason) => (
                <label key={reason} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#1a1a1a' }}>
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={cancellationReason === reason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  {reason}
                </label>
              ))}
            </div>
          </div>

          {cancellationReason === 'Khác' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#1a1a1a' }}>
                Nhập lý do cụ thể
              </label>
              <textarea
                value={cancellationReason === 'Khác' ? '' : cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows="3"
                placeholder="Nhập lý do hủy lịch hẹn..."
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontFamily: 'inherit', 
                  color: '#1a1a1a',
                  resize: 'vertical'
                }}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '0.75rem 1.5rem',
                height: '49.6px',
                background: 'white',
                border: '1px solid #333',
                color: '#333',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={submitting || !cancellationReason.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                height: '49.6px',
                margin: 0,
                background: submitting || !cancellationReason.trim() ? '#ccc' : '#dc3545',
                color: 'white',
                border: '1px solid transparent',
                borderRadius: '8px',
                cursor: submitting || !cancellationReason.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {submitting ? 'Đang hủy...' : 'Xác nhận hủy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelAppointmentModal;
