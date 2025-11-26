import Navbar from '../components/common/Navbar';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <Navbar />
      
      <div className="about-content">
        <div className="about-hero">
          <h1 className="about-title">Về chúng tôi</h1>
          <p className="about-subtitle">
            Doctor Booking - Nền tảng đặt lịch khám bệnh hiện đại và tiện lợi
          </p>
        </div>

        <section className="about-section">
          <div className="about-section-content">
            <h2>Sứ mệnh của chúng tôi</h2>
            <p>
              Doctor Booking được thành lập với sứ mệnh kết nối bệnh nhân với các bác sĩ chuyên khoa 
              hàng đầu một cách nhanh chóng và tiện lợi. Chúng tôi tin rằng việc chăm sóc sức khỏe 
              không nên phức tạp hay tốn thời gian.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-content">
            <h2>Tầm nhìn</h2>
            <p>
              Trở thành nền tảng đặt lịch khám bệnh số 1 tại Việt Nam, mang đến trải nghiệm 
              chăm sóc sức khỏe tốt nhất cho mọi người dân.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-content">
            <h2>Giá trị cốt lõi</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">💚</div>
                <h3>Tận tâm</h3>
                <p>Luôn đặt sức khỏe và sự hài lòng của bệnh nhân lên hàng đầu</p>
              </div>
              <div className="value-card">
                <div className="value-icon">⚡</div>
                <h3>Nhanh chóng</h3>
                <p>Đặt lịch chỉ trong 30 giây, không cần chờ đợi</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🔒</div>
                <h3>Bảo mật</h3>
                <p>Thông tin bệnh nhân được bảo mật tuyệt đối</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🌟</div>
                <h3>Chất lượng</h3>
                <p>Chỉ hợp tác với các bác sĩ và bệnh viện uy tín</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-section-content">
            <h2>Thống kê</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Bệnh nhân hài lòng</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">500+</div>
                <div className="stat-label">Bác sĩ chuyên khoa</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Lượt đặt lịch</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Hỗ trợ trực tuyến</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;

