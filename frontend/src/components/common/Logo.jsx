import './Logo.css';
import logoImage from '../../assets/logo.png';

const Logo = ({ size = 'medium', showSubtitle = true, className = '', useImage = true, imageSrc = null }) => {
  const logoSource = imageSrc || logoImage;
  
  // Sử dụng file ảnh logo
  return (
    <div className={`logo-container ${className}`} data-size={size}>
      <div className="logo-icon">
        <img 
          src={logoSource} 
          alt="Doctor Booking Logo" 
          className="logo-image"
        />
      </div>
      <div className="logo-text">
        <h1 className="logo-title">Doctor Booking</h1>
        {showSubtitle && (
          <p className="logo-subtitle">Trung tâm Y tế & Tư vấn</p>
        )}
      </div>
    </div>
  );

  // SVG logo mặc định
  return (
    <div className={`logo-container ${className}`} data-size={size}>
      <div className="logo-icon">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bottom large base leaf */}
          <ellipse
            cx="40"
            cy="50"
            rx="22"
            ry="18"
            fill="#90EE90"
            opacity="0.95"
            transform="rotate(-15 40 50)"
          />
          {/* Top right leaf */}
          <ellipse
            cx="45"
            cy="30"
            rx="16"
            ry="14"
            fill="#98FB98"
            opacity="0.9"
            transform="rotate(25 45 30)"
          />
          {/* Top left leaf */}
          <ellipse
            cx="35"
            cy="28"
            rx="14"
            ry="12"
            fill="#7CFC00"
            opacity="0.85"
            transform="rotate(-20 35 28)"
          />
        </svg>
      </div>
      <div className="logo-text">
        <h1 className="logo-title">Doctor Booking</h1>
        {showSubtitle && (
          <p className="logo-subtitle">Trung tâm Y tế & Tư vấn</p>
        )}
      </div>
    </div>
  );
};

export default Logo;

