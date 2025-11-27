import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PatientLayout from '../../components/patient/PatientLayout';
import { patientService } from '../../services/patientService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import DataTable from '../../components/common/DataTable';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import '../patient/patientPages.css';

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
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await patientService.getAppointments();
            setAppointments(data);
            setError('');
        } catch (err) {
            setError('Failed to load appointments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            await patientService.cancelAppointment(id);
            setSuccess('Appointment cancelled successfully');
            setTimeout(() => setSuccess(''), 3000);
            loadAppointments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel appointment');
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
    };

    const handleFeedbackSuccess = () => {
        setShowFeedbackModal(false);
        setSelectedAppointment(null);
        setSuccess('Feedback submitted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadAppointments();
    };

    const getStatusColor = useMemo(() => (status) => {
        switch (status) {
            case 'PENDING':
                return '#f39c12';
            case 'CONFIRMED':
                return '#3498db';
            case 'COMPLETED':
                return '#2ecc71';
            case 'CANCELLED':
                return '#e74c3c';
            default:
                return '#95a5a6';
        }
    }, []);

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

    return (
        <PatientLayout>
            <div className="patient-page">
                <h1>Booking History</h1>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <DataTable
                    columns={[
                        {
                            header: 'Doctor',
                            accessor: 'doctorName',
                            render: (appointment) => (
                                <div>
                                    <div style={{ fontWeight: '500' }}>{appointment.doctorName}</div>
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                        {appointment.doctorSpecialization}
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: 'Date',
                            accessor: 'appointmentDate',
                            render: (appointment) => formatDate(appointment.appointmentDate)
                        },
                        {
                            header: 'Time',
                            accessor: 'appointmentTime',
                            render: (appointment) => formatTime(appointment.appointmentTime)
                        },
                        {
                            header: 'Status',
                            accessor: 'status',
                            render: (appointment) => {
                                const color = getStatusColor(appointment.status);
                                return (
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        backgroundColor: color + '20',
                                        color: color,
                                        fontSize: '12px',
                                        fontWeight: '500',
                                    }}>
                    {appointment.status}
                  </span>
                                );
                            }
                        },
                        {
                            header: 'Notes',
                            accessor: 'notes',
                            render: (appointment) => (
                                <div style={{ maxWidth: '200px', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {appointment.notes || '-'}
                                </div>
                            )
                        },
                        {
                            header: 'Actions',
                            align: 'center',
                            render: (appointment) => (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {canCancel(appointment) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancel(appointment.id);
                                            }}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#e74c3c',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                transition: 'background-color 0.2s',
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    {appointment.status === 'COMPLETED' && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDetails(appointment);
                                                }}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#3498db',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    transition: 'background-color 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSendFeedback(appointment);
                                                }}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#2ecc71',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    transition: 'background-color 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#27ae60'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#2ecc71'}
                                            >
                                                Send Feedback
                                            </button>
                                        </>
                                    )}
                                    {appointment.status !== 'COMPLETED' && !canCancel(appointment) && (
                                        <span style={{ fontSize: '12px', color: '#666' }}>-</span>
                                    )}
                                </div>
                            )
                        }
                    ]}
                    data={appointments}
                    loading={loading && appointments.length === 0}
                    emptyMessage={
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p style={{ marginBottom: '15px' }}>No appointments found</p>
                            <Link
                                to="/patient/booking"
                                style={{
                                    display: 'inline-block',
                                    padding: '12px 24px',
                                    backgroundColor: '#2ecc71',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#27ae60';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#2ecc71';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                Book New Appointment
                            </Link>
                        </div>
                    }
                />

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
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Appointment Details</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Appointment Info */}
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Appointment Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div><strong>Doctor:</strong> {appointment.doctorName}</div>
                            <div><strong>Specialization:</strong> {appointment.doctorSpecialization}</div>
                            <div><strong>Date:</strong> {formatDate(appointment.appointmentDate)}</div>
                            <div><strong>Time:</strong> {formatTime(appointment.appointmentTime)}</div>
                            <div><strong>Status:</strong>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: appointment.status === 'COMPLETED' ? '#2ecc7120' : '#3498db20',
                                    color: appointment.status === 'COMPLETED' ? '#2ecc71' : '#3498db',
                                    marginLeft: '10px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                }}>
                  {appointment.status}
                </span>
                            </div>
                            {appointment.notes && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <strong>Notes:</strong> {appointment.notes}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Treatment Info */}
                    {loadingTreatment ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading treatment details...</div>
                    ) : treatment ? (
                        <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                            <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Treatment Information</h3>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {treatment.diagnosis && (
                                    <div>
                                        <strong>Diagnosis:</strong>
                                        <div style={{ marginTop: '5px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                                            {treatment.diagnosis}
                                        </div>
                                    </div>
                                )}
                                {treatment.prescription && (
                                    <div>
                                        <strong>Prescription:</strong>
                                        <div style={{ marginTop: '5px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                                            {treatment.prescription}
                                        </div>
                                    </div>
                                )}
                                {treatment.treatmentNotes && (
                                    <div>
                                        <strong>Treatment Notes:</strong>
                                        <div style={{ marginTop: '5px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                                            {treatment.treatmentNotes}
                                        </div>
                                    </div>
                                )}
                                {treatment.followUpDate && (
                                    <div>
                                        <strong>Follow-up Date:</strong> {formatDate(treatment.followUpDate)}
                                    </div>
                                )}
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                                    Created: {new Date(treatment.createdAt).toLocaleString('en-US', {
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
                        <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
                            No treatment information available for this appointment yet.
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#95a5a6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%',
                    }}
                >
                    Close
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
            setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
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
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Send Feedback</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                    <div><strong>Doctor:</strong> {appointment.doctorName}</div>
                    <div><strong>Date:</strong> {formatDate(appointment.appointmentDate)}</div>
                    <div><strong>Time:</strong> {formatTime(appointment.appointmentTime)}</div>
                </div>

                <ErrorMessage message={error} onClose={() => setError('')} />

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Rating *
                        </label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    style={{
                                        fontSize: '30px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: star <= formData.rating ? '#f39c12' : '#ddd',
                                    }}
                                >
                                    ⭐
                                </button>
                            ))}
                            <span style={{ marginLeft: '10px' }}>({formData.rating}/5)</span>
                        </div>
                        <input
                            type="range"
                            name="rating"
                            min="1"
                            max="5"
                            value={formData.rating}
                            onChange={handleChange}
                            style={{ width: '100%', marginTop: '10px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Comment (Optional)
                        </label>
                        <textarea
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            rows="6"
                            placeholder="Share your experience, suggestions, or concerns..."
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit', fontSize: '16px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#95a5a6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#2ecc71',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting ? 0.6 : 1,
                            }}
                        >
                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingHistory;
