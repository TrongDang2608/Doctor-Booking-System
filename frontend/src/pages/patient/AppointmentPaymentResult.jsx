import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PatientLayout from '../../components/patient/PatientLayout';
import './AppointmentPaymentResult.css';

const AppointmentPaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const code = searchParams.get('code');
  const appointmentId = searchParams.get('appointmentId');
  const vnpAmount = searchParams.get('vnp_Amount');
  const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
  const vnpBankCode = searchParams.get('vnp_BankCode');
  const vnpPayDate = searchParams.get('vnp_PayDate');
  
  const isSuccess = code === '00';

  useEffect(() => {
    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            navigate('/patient/history');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSuccess, navigate]);

  const formatPayDate = (dateStr) => {
    if (!dateStr) return '';
    // Format: yyyyMMddHHmmss -> dd/MM/yyyy HH:mm:ss
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const getMessage = () => {
    if (isSuccess) {
      return 'Thanh toán phí khám bệnh thành công!';
    }
    
    const errorMessages = {
      '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ',
      '09': 'Thẻ chưa đăng ký dịch vụ Internet Banking',
      '10': 'Xác thực thông tin thẻ không đúng quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán',
      '12': 'Thẻ bị khóa',
      '13': 'Nhập sai mật khẩu OTP',
      '24': 'Bạn đã hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định'
    };

    return errorMessages[code] || 'Thanh toán không thành công';
  };

  return (
    <PatientLayout>
      <div className="appointment-payment-result">
        <div className="result-container">
          
          {/* Result Icon */}
          <div className={`result-icon-wrapper ${isSuccess ? 'success' : 'error'}`}>
            <div className="result-icon">
              {isSuccess ? (
                <i data-feather="check-circle"></i>
              ) : (
                <i data-feather="x-circle"></i>
              )}
            </div>
          </div>

          {/* Result Message */}
          <h1 className={`result-title ${isSuccess ? 'success' : 'error'}`}>
            {getMessage()}
          </h1>

          {isSuccess ? (
            <p className="result-subtitle success">
              Lịch hẹn của bạn đã thanh toán thành công và đang chờ được xác nhận .
            </p>
          ) : (
            <p className="result-subtitle error">
              Lịch hẹn đã bị hủy do thanh toán không thành công. Vui lòng thử lại.
            </p>
          )}

          {/* Transaction Details */}
          <div className="transaction-details-card">
            <h3>Chi tiết giao dịch</h3>
            <div className="details-grid">
              
              {appointmentId && (
                <div className="detail-row">
                  <span className="detail-label">
                    <i data-feather="calendar"></i>
                    Mã lịch hẹn
                  </span>
                  <span className="detail-value">#{appointmentId}</span>
                </div>
              )}

              {vnpAmount && (
                <div className="detail-row">
                  <span className="detail-label">
                    <i data-feather="dollar-sign"></i>
                    Số tiền
                  </span>
                  <span className="detail-value amount">
                    {(parseInt(vnpAmount) / 100).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )}

              {vnpTransactionNo && (
                <div className="detail-row">
                  <span className="detail-label">
                    <i data-feather="hash"></i>
                    Mã GD VNPAY
                  </span>
                  <span className="detail-value">{vnpTransactionNo}</span>
                </div>
              )}

              {vnpBankCode && (
                <div className="detail-row">
                  <span className="detail-label">
                    <i data-feather="credit-card"></i>
                    Ngân hàng
                  </span>
                  <span className="detail-value">{vnpBankCode}</span>
                </div>
              )}

              {vnpPayDate && (
                <div className="detail-row">
                  <span className="detail-label">
                    <i data-feather="clock"></i>
                    Thời gian
                  </span>
                  <span className="detail-value">{formatPayDate(vnpPayDate)}</span>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-label">
                  <i data-feather="check-square"></i>
                  Trạng thái thanh toán
                </span>
                <span className={`payment-status-badge ${isSuccess ? 'paid' : 'failed'}`}>
                  {isSuccess ? 'PAID' : 'UNPAID'}
                </span>
              </div>

              {!isSuccess && (
                <div className="detail-row">
                  <span className="detail-label">
                    <i data-feather="info"></i>
                    Trạng thái lịch hẹn
                  </span>
                  <span className="status-badge cancelled">
                    CANCELLED
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="result-actions">
            {isSuccess ? (
              <>
                <p className="countdown-text">
                  <i data-feather="rotate-cw"></i>
                  Tự động chuyển về lịch sử sau {countdown} giây...
                </p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/patient/history')}
                >
                  <i data-feather="list"></i>
                  Xem lịch sử đặt lịch
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/patient/booking')}
                >
                  <i data-feather="refresh-cw"></i>
                  Đặt lịch lại
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => navigate('/patient/history')}
                >
                  <i data-feather="list"></i>
                  Xem lịch sử
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default AppointmentPaymentResult;

