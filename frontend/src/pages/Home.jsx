import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Logo from '../components/common/Logo';
import videoBg from '../assets/625148e1956a6a29189fca52d43d74f576029421.mp4';
import './Home.css';

const Home = () => {
  const features = [
    {
      iconType: 'feather',
      iconName: 'calendar',
      title: 'Đặt lịch dễ dàng',
      description: 'Đặt lịch khám bệnh trực tuyến nhanh chóng, tiện lợi chỉ với vài cú click chuột'
    },
    {
      iconType: 'feather',
      iconName: 'user',
      title: 'Bác sĩ chuyên nghiệp',
      description: 'Đội ngũ bác sĩ giàu kinh nghiệm, được đào tạo chuyên sâu và luôn tận tâm với bệnh nhân'
    },
    {
      iconType: 'feather',
      iconName: 'clock',
      title: 'Tiết kiệm thời gian',
      description: 'Không cần chờ đợi, chọn thời gian phù hợp với lịch trình của bạn'
    },
    {
      iconType: 'feather',
      iconName: 'activity',
      title: 'Quản lý điều trị',
      description: 'Theo dõi lịch sử khám bệnh, đơn thuốc và kết quả điều trị một cách chi tiết'
    },
    {
      iconType: 'feather',
      iconName: 'message-circle',
      title: 'Tư vấn trực tuyến',
      description: 'Nhận tư vấn y tế từ các chuyên gia hàng đầu mọi lúc, mọi nơi'
    },
    {
      iconType: 'feather',
      iconName: 'lock',
      title: 'Bảo mật thông tin',
      description: 'Thông tin cá nhân và hồ sơ bệnh án được bảo mật tuyệt đối'
    }
  ];

  // Initialize Feather Icons
  useEffect(() => {
    const initFeatherIcons = () => {
      if (window.feather) {
        window.feather.replace();
      }
    };
    
    // Initialize after component mounts and DOM is ready
    const timer = setTimeout(initFeatherIcons, 100);
    
    // Also initialize when features are rendered
    const timer2 = setTimeout(initFeatherIcons, 300);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  const stats = [
    { number: '10,000+', label: 'Bệnh nhân hài lòng' },
    { number: '500+', label: 'Bác sĩ chuyên khoa' },
    { number: '50,000+', label: 'Lượt đặt lịch' },
    { number: '24/7', label: 'Hỗ trợ trực tuyến' }
  ];

  return (
    <div className="home-container">
      {/* Video Background */}
      <div className="home-video-wrapper">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="home-video"
        >
          <source src={videoBg} type="video/mp4" />
        </video>
        <div className="home-video-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className="home-nav">
        <div className="home-nav-content">
          <Logo size="medium" showSubtitle={false} />
          <div className="home-nav-actions">
            <Link to="/login" className="nav-link">Đăng nhập</Link>
            <Link to="/register" className="nav-button">Đăng ký</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="hero-title">
            We Always Wants To Bring {''}
            <span className="hero-rotating-text">
              <span className="rotating-word">Smarting</span>
              <span className="rotating-word">Convenient</span>
              <span className="rotating-word">Lightning</span>
            </span>
          </h1>
          <p className="hero-description">
            Hệ thống đặt lịch khám bệnh hiện đại, giúp bạn kết nối với các bác sĩ chuyên khoa hàng đầu. 
            Quản lý sức khỏe của bạn một cách dễ dàng và tiện lợi.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="hero-button primary">Bắt đầu ngay</Link>
            <Link to="/login" className="hero-button secondary">Đã có tài khoản?</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="home-stats">
        <div className="home-stats-content">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="home-features-content">
          <h2 className="section-title">Tại sao chọn chúng tôi?</h2>
          <p className="section-subtitle">
            Chúng tôi cung cấp giải pháp toàn diện cho việc quản lý sức khỏe và đặt lịch khám bệnh
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.iconType === 'feather' ? (
                    <i data-feather={feature.iconName}></i>
                  ) : (
                    <ion-icon name={feature.iconName}></ion-icon>
                  )}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="home-how-it-works">
        <div className="home-how-it-works-content">
          <h2 className="section-title">Cách thức hoạt động</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3 className="step-title">Đăng ký tài khoản</h3>
              <p className="step-description">Tạo tài khoản miễn phí trong vài phút</p>
            </div>
            <div className="step-arrow">
              <i data-feather="arrow-right"></i>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3 className="step-title">Tìm bác sĩ</h3>
              <p className="step-description">Tìm kiếm và chọn bác sĩ phù hợp với nhu cầu của bạn</p>
            </div>
            <div className="step-arrow">
              <i data-feather="arrow-right"></i>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3 className="step-title">Đặt lịch hẹn</h3>
              <p className="step-description">Chọn thời gian và ngày khám phù hợp</p>
            </div>
            <div className="step-arrow">
              <i data-feather="arrow-right"></i>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <h3 className="step-title">Khám và điều trị</h3>
              <p className="step-description">Đến khám và nhận tư vấn từ bác sĩ</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <div className="home-cta-content">
          <h2 className="cta-title">Sẵn sàng bắt đầu?</h2>
          <p className="cta-description">
            Tham gia cùng hàng nghìn bệnh nhân đã tin tưởng sử dụng dịch vụ của chúng tôi
          </p>
          <div className="cta-actions">
            <Link to="/register" className="cta-button primary">Đăng ký miễn phí</Link>
            <Link to="/login" className="cta-button secondary">Đăng nhập</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-content">
          <Logo size="small" showSubtitle={true} />
          <p className="footer-text">© 2024 Doctor Booking. Tất cả quyền được bảo lưu.</p>
          <div className="footer-links">
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

