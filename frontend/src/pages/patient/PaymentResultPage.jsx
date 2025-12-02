import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/patient/PatientLayout';
import './PaymentResultPage.css';

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [result, setResult] = useState(null);

  // Helper function to get error message from VNPAY response code
  const getErrorMessage = (code) => {
    const errorMessages = {
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Xác thực thông tin thẻ/tài khoản không đúng. Quá 3 lần',
      '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
      '12': 'Thẻ/Tài khoản bị khóa.',
      '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP). Quá 3 lần',
      '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
      '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Lỗi không xác định',
    };
    return errorMessages[code] || 'Thanh toán thất bại. Vui lòng thử lại sau.';
  };

  useEffect(() => {
    // Parse query params from VNPAY callback
    // VNPAY returns params directly, backend also adds code and message
    const code = searchParams.get('code');
    const message = searchParams.get('message');
    const transactionId = searchParams.get('transactionId');
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');
    const vnp_Amount = searchParams.get('vnp_Amount');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');
    const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
    const vnp_BankCode = searchParams.get('vnp_BankCode');
    const vnp_PayDate = searchParams.get('vnp_PayDate');

    // Determine result based on response code
    // VNPAY success code is '00', or use backend code
    const isSuccess = code === '00' || vnp_ResponseCode === '00';
    
    // Get amount - VNPAY returns amount * 100
    let amount = null;
    if (vnp_Amount) {
      amount = parseInt(vnp_Amount) / 100;
    } else if (transactionId) {
      // Try to get from transaction if available
      amount = null; // Will be loaded from API if needed
    }
    
    setResult({
      success: isSuccess,
      code: code || vnp_ResponseCode || 'UNKNOWN',
      message: message || (isSuccess ? 'Thanh toán thành công' : getErrorMessage(vnp_ResponseCode || code)),
      transactionId: transactionId || vnp_TxnRef,
      transactionNo: vnp_TransactionNo,
      amount: amount,
      orderInfo: vnp_OrderInfo,
      bankCode: vnp_BankCode,
      payDate: vnp_PayDate
    });

    // Auto redirect after countdown
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/patient/wallet');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [searchParams, navigate]);

  const handleBackToWallet = () => {
    navigate('/patient/wallet');
  };

  // Format VNPAY pay date (format: yyyyMMddHHmmss)
  const formatPayDate = (payDate) => {
    if (!payDate || payDate.length !== 14) return payDate;
    const year = payDate.substring(0, 4);
    const month = payDate.substring(4, 6);
    const day = payDate.substring(6, 8);
    const hour = payDate.substring(8, 10);
    const minute = payDate.substring(10, 12);
    const second = payDate.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  if (!result) {
    return (
      <PatientLayout>
        <div className="payment-result-page">
          <div className="payment-result-loading">
            <div className="loading-spinner"></div>
            <p>Đang xử lý kết quả thanh toán...</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="payment-result-page">
        <div className="payment-result-container">
          {result.success ? (
            <>
              <div className="result-icon success">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="result-title success">Thanh toán thành công!</h1>
              <p className="result-message">
                Giao dịch của bạn đã được xử lý thành công. Số dư ví đã được cập nhật.
              </p>
            </>
          ) : (
            <>
              <div className="result-icon error">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="result-title error">Thanh toán thất bại</h1>
              <p className="result-message">
                {result.message || 'Giao dịch không thể hoàn tất. Vui lòng thử lại sau.'}
              </p>
            </>
          )}

          <div className="result-details">
            {result.transactionId && (
              <div className="detail-item">
                <span className="detail-label">Mã giao dịch:</span>
                <span className="detail-value">{result.transactionId}</span>
              </div>
            )}
            {result.transactionNo && (
              <div className="detail-item">
                <span className="detail-label">Mã tham chiếu VNPAY:</span>
                <span className="detail-value">{result.transactionNo}</span>
              </div>
            )}
            {result.amount && (
              <div className="detail-item">
                <span className="detail-label">Số tiền:</span>
                <span className="detail-value">{result.amount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            )}
            {result.bankCode && (
              <div className="detail-item">
                <span className="detail-label">Ngân hàng:</span>
                <span className="detail-value">{result.bankCode}</span>
              </div>
            )}
            {result.payDate && (
              <div className="detail-item">
                <span className="detail-label">Thời gian thanh toán:</span>
                <span className="detail-value">{formatPayDate(result.payDate)}</span>
              </div>
            )}
            {result.orderInfo && (
              <div className="detail-item">
                <span className="detail-label">Mô tả:</span>
                <span className="detail-value">{result.orderInfo}</span>
              </div>
            )}
            {result.code && result.code !== '00' && (
              <div className="detail-item">
                <span className="detail-label">Mã phản hồi:</span>
                <span className="detail-value">{result.code}</span>
              </div>
            )}
          </div>

          <div className="result-actions">
            {result.success && countdown > 0 && (
              <p className="countdown-text">
                Tự động chuyển về trang ví sau {countdown} giây...
              </p>
            )}
            <button className="btn-back-to-wallet" onClick={handleBackToWallet}>
              {result.success ? 'Quay về ví' : 'Thử lại'}
            </button>
            {result.success && (
              <button className="btn-view-transactions" onClick={() => navigate('/patient/wallet?tab=transactions')}>
                Xem lịch sử giao dịch
              </button>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default PaymentResultPage;

