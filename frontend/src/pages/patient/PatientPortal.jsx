import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AISymptomChecker from '../../components/patient/AISymptomChecker';
import HealthWallet from '../../components/patient/HealthWallet';
import FamilyAccount from '../../components/patient/FamilyAccount';
import './PatientPortal.css';

const PatientPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('chat'); // chat | wallet | family | booking
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when new message arrives
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(inputValue),
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('đau') || lowerInput.includes('triệu chứng')) {
      return 'Tôi hiểu bạn đang gặp vấn đề về sức khỏe. Hãy mô tả chi tiết hơn về triệu chứng của bạn, và tôi sẽ đề xuất chuyên khoa phù hợp hoặc hướng dẫn bạn đến bác sĩ.';
    }
    
    if (lowerInput.includes('đặt lịch') || lowerInput.includes('booking')) {
      return 'Bạn muốn đặt lịch khám? Tôi có thể giúp bạn tìm bác sĩ phù hợp. Hãy cho tôi biết chuyên khoa hoặc triệu chứng của bạn.';
    }
    
    if (lowerInput.includes('ví') || lowerInput.includes('wallet') || lowerInput.includes('thanh toán')) {
      setActiveMode('wallet');
      return 'Đang mở Ví Sức khỏe của bạn...';
    }
    
    if (lowerInput.includes('gia đình') || lowerInput.includes('family')) {
      setActiveMode('family');
      return 'Đang mở Quản lý Gia đình...';
    }
    
    return 'Tôi có thể giúp bạn:\n- Mô tả triệu chứng để tìm chuyên khoa phù hợp\n- Đặt lịch khám với bác sĩ\n- Quản lý ví sức khỏe và voucher\n- Quản lý hồ sơ gia đình\n\nBạn cần hỗ trợ gì?';
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setChatHistory([]);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const quickActions = [
    { id: 'symptom', label: 'Kiểm tra triệu chứng', icon: '🔍', action: () => setActiveMode('symptom') },
    { id: 'booking', label: 'Đặt lịch khám', icon: '📅', action: () => navigate('/patient/booking') },
    { id: 'wallet', label: 'Ví Sức khỏe', icon: '💰', action: () => setActiveMode('wallet') },
    { id: 'family', label: 'Gia đình', icon: '👨‍👩‍👧‍👦', action: () => setActiveMode('family') },
    { id: 'history', label: 'Lịch sử', icon: '📋', action: () => navigate('/patient/history') },
  ];

  return (
    <div className="patient-portal">
      {/* Header */}
      <header className="portal-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">HealthAI</span>
          </div>
        </div>
        <div className="header-right">
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.fullName || user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>
                <i data-feather="log-out"></i>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button onClick={() => navigate('/login')}>Sign in</button>
              <button onClick={() => navigate('/register')}>Sign up</button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="portal-main">
        {/* Left Sidebar - Chat History */}
        <aside className="portal-sidebar-left">
          <div className="sidebar-header">
            <h3>Lịch sử</h3>
            <button className="icon-btn" title="Xóa lịch sử">
              <i data-feather="trash-2"></i>
            </button>
          </div>
          <div className="chat-history-list">
            {chatHistory.length === 0 ? (
              <div className="empty-state">
                <i data-feather="message-circle"></i>
                <p>Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              <div className="history-items">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className="history-item">
                    <span className="history-preview">
                      {msg.content.substring(0, 30)}...
                    </span>
                    <span className="history-time">
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Center - Chat Interface */}
        <main className="portal-center">
          {activeMode === 'chat' && (
            <div className="chat-container">
              <div className="chat-messages">
                {chatHistory.length === 0 ? (
                  <div className="welcome-screen">
                    <h2>Xin chào! Tôi là HealthAI</h2>
                    <p>Tôi có thể giúp bạn quản lý sức khỏe một cách thông minh</p>
                    <div className="quick-actions-grid">
                      {quickActions.map((action) => (
                        <button
                          key={action.id}
                          className="quick-action-btn"
                          onClick={action.action}
                        >
                          <span className="action-icon">{action.icon}</span>
                          <span className="action-label">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.type}`}
                      >
                        <div className="message-avatar">
                          {message.type === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="message-content">
                          <div className="message-text">
                            {message.content.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                          <div className="message-time">
                            {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="message ai typing">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <form className="chat-input-container" onSubmit={handleSubmit}>
                <div className="feature-buttons">
                  <button
                    type="button"
                    className="feature-btn"
                    title="Tìm kiếm sâu"
                    onClick={() => setActiveMode('symptom')}
                  >
                    <i data-feather="search"></i>
                    <span>DeepSearch</span>
                  </button>
                  <button
                    type="button"
                    className="feature-btn"
                    title="Ví Sức khỏe"
                    onClick={() => setActiveMode('wallet')}
                  >
                    <i data-feather="wallet"></i>
                    <span>Wallet</span>
                  </button>
                  <button
                    type="button"
                    className="feature-btn"
                    title="Gia đình"
                    onClick={() => setActiveMode('family')}
                  >
                    <i data-feather="users"></i>
                    <span>Family</span>
                  </button>
                  <button
                    type="button"
                    className="feature-btn"
                    title="Đặt lịch"
                    onClick={() => navigate('/patient/booking')}
                  >
                    <i data-feather="calendar"></i>
                    <span>Booking</span>
                  </button>
                </div>
                <div className="chat-input-wrapper">
                  <input
                    ref={inputRef}
                    type="text"
                    className="chat-input"
                    placeholder="Hỏi HealthAI bất cứ điều gì về sức khỏe..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
                    <i data-feather="send"></i>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Symptom Checker Mode */}
          {activeMode === 'symptom' && (
            <div className="mode-container">
              <div className="mode-header">
                <button className="back-btn" onClick={() => setActiveMode('chat')}>
                  <i data-feather="arrow-left"></i>
                  Quay lại
                </button>
                <h2>Trợ lý AI - Kiểm tra Triệu chứng</h2>
              </div>
              <AISymptomChecker />
            </div>
          )}

          {/* Wallet Mode */}
          {activeMode === 'wallet' && (
            <div className="mode-container">
              <div className="mode-header">
                <button className="back-btn" onClick={() => setActiveMode('chat')}>
                  <i data-feather="arrow-left"></i>
                  Quay lại
                </button>
                <h2>Ví Sức khỏe & Loyalty</h2>
              </div>
              <HealthWallet />
            </div>
          )}

          {/* Family Mode */}
          {activeMode === 'family' && (
            <div className="mode-container">
              <div className="mode-header">
                <button className="back-btn" onClick={() => setActiveMode('chat')}>
                  <i data-feather="arrow-left"></i>
                  Quay lại
                </button>
                <h2>Quản lý Gia đình</h2>
              </div>
              <FamilyAccount />
            </div>
          )}
        </main>

        {/* Right Sidebar - Additional Info */}
        <aside className="portal-sidebar-right">
          <div className="sidebar-section">
            <h3>Thông tin nhanh</h3>
            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">📅</div>
                <div className="info-content">
                  <span className="info-label">Lịch hẹn sắp tới</span>
                  <span className="info-value">2</span>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">💰</div>
                <div className="info-content">
                  <span className="info-label">Điểm tích lũy</span>
                  <span className="info-value">1,250</span>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">👨‍👩‍👧‍👦</div>
                <div className="info-content">
                  <span className="info-label">Thành viên</span>
                  <span className="info-value">3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Gợi ý</h3>
            <div className="suggestions">
              <button className="suggestion-item" onClick={() => setInputValue('Tôi bị đau đầu, nên khám ở đâu?')}>
                <i data-feather="help-circle"></i>
                <span>Đau đầu nên khám ở đâu?</span>
              </button>
              <button className="suggestion-item" onClick={() => setInputValue('Cách đặt lịch khám nhanh nhất?')}>
                <i data-feather="help-circle"></i>
                <span>Cách đặt lịch khám nhanh?</span>
              </button>
              <button className="suggestion-item" onClick={() => setInputValue('Kiểm tra số dư ví sức khỏe')}>
                <i data-feather="help-circle"></i>
                <span>Kiểm tra số dư ví</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PatientPortal;

