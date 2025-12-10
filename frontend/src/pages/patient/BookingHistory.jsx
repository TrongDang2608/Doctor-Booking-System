import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PatientLayout from '../../components/patient/PatientLayout';
import { patientService } from '../../services/patientService';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import '../patient/patientPages.css';
import './BookingHistory.css';

const BookingHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [treatment, setTreatment] = useState(null);
    const [loadingTreatment, setLoadingTreatment] = useState(false);

    useEffect(() => {
        loadAppointments();
        // Initialize Feather Icons
        if (window.feather) {
            window.feather.replace();
        }
    }, []);

    useEffect(() => {
        // Replace icons when appointments change
        if (window.feather) {
            setTimeout(() => window.feather.replace(), 100);
        }
    }, [appointments]);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await patientService.getAppointments();
            setAppointments(data);
            setError('');
        } catch (err) {
            setError('Không thể tải lịch hẹn');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
            return;
        }

        try {
            await patientService.cancelAppointment(id);
            setSuccess('Hủy lịch hẹn thành công');
            setTimeout(() => setSuccess(''), 3000);
            loadAppointments();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể hủy lịch hẹn');
        }
    };

    const handleViewDetails = async (appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailsModal(true);
        setLoadingTreatment(true);
        setTreatment(null);

        // Load treatment if appointment is completed
        if (appointment.status === 'COMPLETED') {
            try {
                const treatmentData = await patientService.getTreatmentByAppointmentId(appointment.id);
                setTreatment(treatmentData);
            } catch (err) {
                // Treatment might not exist yet
                console.log('No treatment found for this appointment');
            } finally {
                setLoadingTreatment(false);
            }
        } else {
            setLoadingTreatment(false);
        }
    };

    const handleSendFeedback = (appointment) => {
        setSelectedAppointment(appointment);
        setShowFeedbackModal(true);
        setError(''); // Clear any existing errors
    };

    const handleFeedbackSuccess = () => {
        setShowFeedbackModal(false);
        setSelectedAppointment(null);
        setSuccess('Feedback submitted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadAppointments();
    };

    const canCancel = (appointment) => {
        return appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED';
    };

    if (loading) {
        return (
            <PatientLayout>
                <Loading />
            </PatientLayout>
        );
    }

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'CASH': return '💵';
            case 'VNPAY': return '🏦';
            case 'WALLET': return '💰';
            default: return '💳';
        }
    };

    const getPaymentMethodName = (method) => {
        switch (method) {
            case 'CASH': return 'Tiền mặt';
            case 'VNPAY': return 'VNPAY';
            case 'WALLET': return 'Ví Sức khỏe';
            default: return method || 'Chưa xác định';
        }
    };

    return (
        <PatientLayout>
            <div className="booking-history-page">
                <div className="history-header">
                    <h1>Lịch Sử Đặt Lịch</h1>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {appointments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <h3>Chưa có lịch hẹn nào</h3>
                        <p>Bắt đầu đặt lịch khám bệnh với bác sĩ ngay bây giờ</p>
                        <Link to="/patient/booking" className="empty-state-btn">
                            <i data-feather="calendar"></i>
                            Đặt lịch mới
                        </Link>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {appointments.map(appointment => (
                            <div 
                                key={appointment.id} 
                                className={`appointment-card status-${appointment.status.toLowerCase()}`}
                            >
                                {/* Header */}
                                <div className="appointment-card-header">
                                    <div className="appointment-doctor">
                                        <div className="doctor-name">
                                            <i data-feather="user"></i>
                                            Dr. {appointment.doctorName}
                                        </div>
                                        <div className="doctor-specialty">
                                            <i data-feather="heart"></i>
                                            {appointment.doctorSpecialization}
                                        </div>
                                    </div>
                                    <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                                        {appointment.status}
                                    </span>
                                </div>

                                {/* Info Grid */}
                                <div className="appointment-info-grid">
                                    <div className="info-item">
                                        <div className="info-label">
                                            <i data-feather="calendar"></i>
                                            Ngày khám
                                        </div>
                                        <div className="info-value">{formatDate(appointment.appointmentDate)}</div>
                                    </div>
                                    
                                    <div className="info-item">
                                        <div className="info-label">
                                            <i data-feather="clock"></i>
                                            Giờ khám
                                        </div>
                                        <div className="info-value">{formatTime(appointment.appointmentTime)}</div>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                {appointment.price > 0 && (
                                    <div className="payment-info">
                                        <div className="payment-amount">
                                            {Number(appointment.price).toLocaleString('vi-VN')} VNĐ
                                        </div>
                                        <div className="payment-details">
                                            <span className={`payment-method-badge ${appointment.paymentMethod?.toLowerCase() || ''}`}>
                                                <span>{getPaymentMethodIcon(appointment.paymentMethod)}</span>
                                                {getPaymentMethodName(appointment.paymentMethod)}
                                            </span>
                                            <span className={`payment-status-badge ${appointment.paymentStatus?.toLowerCase() || 'pending'}`}>
                                                <i data-feather={appointment.paymentStatus === 'PAID' ? 'check-circle' : 'clock'}></i>
                                                {appointment.paymentStatus || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {appointment.notes && (
                                    <div className="appointment-notes">
                                        <i data-feather="message-circle"></i> {appointment.notes}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="appointment-actions">
                                    {canCancel(appointment) && (
                                        <button
                                            onClick={() => handleCancel(appointment.id)}
                                            className="action-btn cancel"
                                        >
                                            <i data-feather="x-circle"></i>
                                            Hủy lịch hẹn
                                        </button>
                                    )}
                                    
                                    {appointment.status === 'COMPLETED' && (
                                        <>
                                            <button
                                                onClick={() => handleViewDetails(appointment)}
                                                className="action-btn view"
                                            >
                                                <i data-feather="file-text"></i>
                                                Xem kết quả khám
                                            </button>
                                            <button
                                                onClick={() => handleSendFeedback(appointment)}
                                                className="action-btn feedback"
                                            >
                                                <i data-feather="star"></i>
                                                Gửi đánh giá
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}


                {/* Appointment Details Modal */}
                {showDetailsModal && selectedAppointment && (
                    <AppointmentDetailsModal
                        appointment={selectedAppointment}
                        treatment={treatment}
                        loadingTreatment={loadingTreatment}
                        onClose={() => {
                            setShowDetailsModal(false);
                            setSelectedAppointment(null);
                            setTreatment(null);
                        }}
                    />
                )}

                {/* Feedback Modal */}
                {showFeedbackModal && selectedAppointment && (
                    <FeedbackModal
                        appointment={selectedAppointment}
                        onClose={() => {
                            setShowFeedbackModal(false);
                            setSelectedAppointment(null);
                        }}
                        onSuccess={handleFeedbackSuccess}
                    />
                )}
            </div>
        </PatientLayout>
    );
};

// Appointment Details Modal Component
const AppointmentDetailsModal = ({ appointment, treatment, loadingTreatment, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                backgroundColor: 'rgba(20, 20, 20, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2rem',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
                color: '#e0e0e0',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: '#e0e0e0', fontSize: '1.5rem' }}>Chi Tiết Lịch Hẹn</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#e0e0e0',
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                        ×
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Appointment Info */}
                    <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#e0e0e0', fontSize: '1.1rem' }}>Thông tin lịch hẹn</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#aaa' }}>
                            <div><strong style={{ color: '#e0e0e0' }}>Bác sĩ:</strong> {appointment.doctorName}</div>
                            <div><strong style={{ color: '#e0e0e0' }}>Chuyên khoa:</strong> {appointment.doctorSpecialization}</div>
                            <div><strong style={{ color: '#e0e0e0' }}>Ngày:</strong> {formatDate(appointment.appointmentDate)}</div>
                            <div><strong style={{ color: '#e0e0e0' }}>Giờ:</strong> {formatTime(appointment.appointmentTime)}</div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <strong style={{ color: '#e0e0e0' }}>Trạng thái:</strong>
                                <span className={`status-badge ${appointment.status.toLowerCase()}`} style={{ marginLeft: '0.75rem' }}>
                                    {appointment.status}
                                </span>
                            </div>
                            {appointment.notes && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <strong style={{ color: '#e0e0e0' }}>Ghi chú:</strong> {appointment.notes}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Treatment Info */}
                    {loadingTreatment ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                            <div className="loading-spinner-medium" style={{ margin: '0 auto 1rem' }}></div>
                            Đang tải thông tin điều trị...
                        </div>
                    ) : treatment ? (
                        <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h3 style={{ marginBottom: '1rem', color: '#10b981', fontSize: '1.1rem' }}>Thông tin điều trị</h3>
                            <div style={{ display: 'grid', gap: '1rem', color: '#aaa' }}>
                                {treatment.diagnosis && (
                                    <div>
                                        <strong style={{ color: '#e0e0e0' }}>Chẩn đoán:</strong>
                                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#e0e0e0' }}>
                                            {treatment.diagnosis}
                                        </div>
                                    </div>
                                )}
                                {treatment.prescription && (
                                    <div>
                                        <strong style={{ color: '#e0e0e0' }}>Đơn thuốc:</strong>
                                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#e0e0e0' }}>
                                            {treatment.prescription}
                                        </div>
                                    </div>
                                )}
                                {treatment.treatmentNotes && (
                                    <div>
                                        <strong style={{ color: '#e0e0e0' }}>Ghi chú điều trị:</strong>
                                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#e0e0e0' }}>
                                            {treatment.treatmentNotes}
                                        </div>
                                    </div>
                                )}
                                {treatment.followUpDate && (
                                    <div>
                                        <strong style={{ color: '#e0e0e0' }}>Ngày tái khám:</strong> {formatDate(treatment.followUpDate)}
                                    </div>
                                )}
                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                                    Tạo lúc: {new Date(treatment.createdAt).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '1.25rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                            Chưa có thông tin điều trị cho lịch hẹn này.
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '1.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        width: '100%',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

// Feedback Modal Component
const FeedbackModal = ({ appointment, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        rating: 5,
        comment: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await patientService.createFeedback({
                appointmentId: appointment.id,
                rating: parseInt(formData.rating),
                comment: formData.comment,
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
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
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                backgroundColor: 'rgba(20, 20, 20, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2rem',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                color: '#e0e0e0',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Gửi Đánh Giá</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#e0e0e0',
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    >
                        ×
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ marginBottom: '0.5rem' }}><strong>Bác sĩ:</strong> {appointment.doctorName}</div>
                    <div style={{ marginBottom: '0.5rem' }}><strong>Ngày:</strong> {formatDate(appointment.appointmentDate)}</div>
                    <div><strong>Giờ:</strong> {formatTime(appointment.appointmentTime)}</div>
                </div>


                {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: '#e0e0e0' }}>
                            Đánh giá *
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    style={{
                                        fontSize: '2rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: star <= formData.rating ? '#f59e0b' : '#444',
                                        transition: 'all 0.2s',
                                        transform: star <= formData.rating ? 'scale(1.1)' : 'scale(1)',
                                    }}
                                >
                                    ⭐
                                </button>
                            ))}
                            <span style={{ marginLeft: '1rem', color: '#888' }}>({formData.rating}/5)</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: '#e0e0e0' }}>
                            Nhận xét (Tùy chọn)
                        </label>
                        <textarea
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            rows="6"
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            style={{ 
                                width: '100%', 
                                padding: '0.75rem', 
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                borderRadius: '8px', 
                                fontFamily: 'inherit', 
                                fontSize: '0.95rem',
                                color: '#e0e0e0',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                height: '49.6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#e0e0e0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: '0.75rem 1.5rem',
                                height: '49.6px',
                                margin: 0,
                                background: submitting ? 'rgba(16, 185, 129, 0.5)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: '1px solid transparent',
                                borderRadius: '8px',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => !submitting && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingHistory;
