import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AISymptomChecker from './AISymptomChecker';
import HealthWallet from './HealthWallet';
import FamilyAccount from './FamilyAccount';
import './HealthAIChat.css';

const HealthAIChat = ({ onClose, isFullPage = false }) => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('chat');
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
    if (inputRef.current && activeMode === 'chat') {
      inputRef.current.focus();
    }
  }, [activeMode]);

  useEffect(() => {
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

  const quickActions = [
    { id: 'symptom', label: 'Kiểm tra triệu chứng', icon: '🔍', action: () => setActiveMode('symptom') },
    { id: 'booking', label: 'Đặt lịch khám', icon: '📅', action: () => navigate('/patient/booking') },
    { id: 'wallet', label: 'Ví Sức khỏe', icon: '💰', action: () => setActiveMode('wallet') },
    { id: 'family', label: 'Gia đình', icon: '👨‍👩‍👧‍👦', action: () => setActiveMode('family') },
    { id: 'history', label: 'Lịch sử', icon: '📋', action: () => navigate('/patient/history') },
  ];

  return (
    <div className={`healthai-chat-panel ${isFullPage ? 'full-page' : ''}`}>
      <div className="chat-panel-header">
        <div className="chat-header-left">
          <div className="chat-avatar">🤖</div>
          <div>
            <h3>HealthAI</h3>
            <p>Trợ lý sức khỏe thông minh</p>
          </div>
        </div>
        {!isFullPage && (
          <button className="close-chat-btn" onClick={onClose}>
            <i data-feather="x"></i>
          </button>
        )}
      </div>

      <div className="chat-panel-content">
        {activeMode === 'chat' && (
          <div className="chat-interface">
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
              <div className="input-wrapper">
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

        {activeMode === 'symptom' && (
          <>
            <div className="mode-header">
              <button className="back-btn" onClick={() => setActiveMode('chat')}>
                <i data-feather="arrow-left"></i>
                Quay lại
              </button>
              <h2>Trợ lý AI - Kiểm tra Triệu chứng</h2>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <AISymptomChecker />
            </div>
          </>
        )}

        {activeMode === 'wallet' && (
          <>
            <div className="mode-header">
              <button className="back-btn" onClick={() => setActiveMode('chat')}>
                <i data-feather="arrow-left"></i>
                Quay lại
              </button>
              <h2>Ví Sức khỏe & Loyalty</h2>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <HealthWallet />
            </div>
          </>
        )}

        {activeMode === 'family' && (
          <>
            <div className="mode-header">
              <button className="back-btn" onClick={() => setActiveMode('chat')}>
                <i data-feather="arrow-left"></i>
                Quay lại
              </button>
              <h2>Quản lý Gia đình</h2>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <FamilyAccount />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HealthAIChat;

