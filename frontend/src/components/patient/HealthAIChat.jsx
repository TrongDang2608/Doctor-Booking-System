import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
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
    if (window.feather) window.feather.replace();
    if (inputRef.current && activeMode === 'chat') inputRef.current.focus();
  }, [activeMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e) => {
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

    try {
      // Logic điều hướng nhanh client-side
      const lowerInput = userMessage.content.toLowerCase();
      if (lowerInput.includes('ví') || lowerInput.includes('wallet')) {
        setTimeout(() => { setActiveMode('wallet'); setIsTyping(false); }, 500);
        return;
      }
      if (lowerInput.includes('gia đình') || lowerInput.includes('family')) {
        setTimeout(() => { setActiveMode('family'); setIsTyping(false); }, 500);
        return;
      }

      // Gọi AI Service
      const data = await patientService.checkSymptoms(userMessage.content);

      // Xử lý logic hiển thị
      // Nếu là 'Other' hoặc 'General' (khi không có khoa phù hợp), ta sẽ không hiện nút đặt lịch
      const isBookingAvailable = data.suggestedSpecialization &&
          data.suggestedSpecialization !== 'Other' &&
          data.suggestedSpecialization !== 'General';

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.advice, // Lời khuyên chính
        homeRemedies: data.homeRemedies, // Cách giảm đau tại nhà
        reason: data.reason,
        timestamp: new Date(),
        // Chỉ tạo object suggestion nếu có khoa phù hợp
        suggestion: isBookingAvailable ? {
          specialty: data.suggestedSpecialization,
          risk: data.riskLevel
        } : null
      };

      setChatHistory(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Xin lỗi, hệ thống đang bận hoặc gặp lỗi kết nối. Vui lòng thử lại sau.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickNavigate = (specialty) => {
    navigate(`/patient/doctors?search=${specialty}`);
    if (onClose) onClose();
  };

  const quickActions = [
    { id: 'symptom', label: 'Check Triệu chứng', icon: '🔍', action: () => setActiveMode('symptom') },
    { id: 'booking', label: 'Đặt lịch khám', icon: '📅', action: () => navigate('/patient/booking') },
    { id: 'wallet', label: 'Ví Sức khỏe', icon: '💰', action: () => setActiveMode('wallet') },
    { id: 'family', label: 'Gia đình', icon: '👨‍👩‍👧‍👦', action: () => setActiveMode('family') },
  ];

  return (
      <div className={`healthai-chat-panel ${isFullPage ? 'full-page' : ''}`}>
        <div className="chat-panel-header">
          <div className="chat-header-left">
            <div className="chat-avatar">🤖</div>
            <div><h3>HealthAI</h3><p>Trợ lý sức khỏe thông minh</p></div>
          </div>
          {!isFullPage && <button className="close-chat-btn" onClick={onClose}><i data-feather="x"></i></button>}
        </div>

        <div className="chat-panel-content">
          {activeMode === 'chat' && (
              <div className="chat-interface">
                <div className="chat-messages">
                  {chatHistory.length === 0 ? (
                      <div className="welcome-screen">
                        <h2>Xin chào!</h2>
                        <p>Mô tả triệu chứng để tôi tư vấn cách xử lý và tìm bác sĩ phù hợp.</p>
                        <div className="quick-actions-grid">
                          {quickActions.map(action => (
                              <button key={action.id} className="quick-action-btn" onClick={action.action}>
                                <span className="action-icon">{action.icon}</span>
                                <span className="action-label">{action.label}</span>
                              </button>
                          ))}
                        </div>
                      </div>
                  ) : (
                      <>
                        {chatHistory.map(msg => (
                            <div key={msg.id} className={`message ${msg.type}`}>
                              <div className="message-avatar">{msg.type === 'user' ? '👤' : '🤖'}</div>
                              <div className="message-content">
                                <div className="message-text">
                                  {/* Hiển thị nội dung chính */}
                                  <p style={{whiteSpace: 'pre-line'}}>{msg.content}</p>

                                  {/* Hiển thị phần chi tiết từ AI */}
                                  {msg.type === 'ai' && (
                                      <div className="ai-details" style={{fontSize: '0.9rem', marginTop: '10px'}}>

                                        {/* 1. Lý do chẩn đoán (Chữ nhỏ, màu xám) */}
                                        {msg.reason && (
                                            <p style={{color: '#666', fontStyle: 'italic', marginBottom: '8px'}}>
                                              🔍 <strong>Chẩn đoán:</strong> {msg.reason}
                                            </p>
                                        )}

                                        {/* 2. Lời khuyên tại nhà (Khung màu xanh) */}
                                        {msg.homeRemedies && msg.homeRemedies.length > 0 && (
                                            <div style={{
                                              backgroundColor: '#f0fdf4',
                                              borderLeft: '4px solid #22c55e',
                                              padding: '10px',
                                              borderRadius: '4px',
                                              marginTop: '8px',
                                              color: '#14532d'
                                            }}>
                                              <strong>💊 Lời khuyên tại nhà:</strong>
                                              <ul style={{marginTop: '4px', paddingLeft: '20px', margin: '5px 0'}}>
                                                {msg.homeRemedies.map((item, index) => (
                                                    <li key={index} style={{marginBottom: '4px'}}>{item}</li>
                                                ))}
                                              </ul>
                                            </div>
                                        )}
                                      </div>
                                  )}
                                </div>

                                {/* Nút đặt lịch CHỈ HIỆN KHI có khoa phù hợp (suggestion khác null) */}
                                {msg.type === 'ai' && msg.suggestion && (
                                    <div style={{marginTop: '12px'}}>
                                      <button
                                          className="feature-btn"
                                          style={{
                                            backgroundColor: '#eff6ff',
                                            color: '#1d4ed8',
                                            border: '1px solid #bfdbfe',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
                                          }}
                                          onClick={() => handleQuickNavigate(msg.suggestion.specialty)}
                                      >
                                        📅 Đặt lịch khám {msg.suggestion.specialty} ngay
                                      </button>
                                    </div>
                                )}

                                <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</div>
                              </div>
                            </div>
                        ))}
                        {isTyping && <div className="message ai typing"><div className="message-avatar">🤖</div><div className="message-content"><div className="typing-indicator"><span></span><span></span><span></span></div></div></div>}
                        <div ref={chatEndRef} />
                      </>
                  )}
                </div>

                <form className="chat-input-container" onSubmit={handleSubmit}>
                  <div className="input-wrapper">
                    <input
                        ref={inputRef} type="text" className="chat-input"
                        placeholder="Ví dụ: Đau đầu, chóng mặt, buồn nôn..."
                        value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button type="submit" className="send-btn" disabled={!inputValue.trim()}><i data-feather="send"></i></button>
                  </div>
                </form>
              </div>
          )}

          {/* Giữ nguyên các mode con khác */}
          {activeMode === 'symptom' && <div style={{padding:'1rem'}}><AISymptomChecker /></div>}
          {activeMode === 'wallet' && <div style={{padding:'1rem'}}><HealthWallet /></div>}
          {activeMode === 'family' && <div style={{padding:'1rem'}}><FamilyAccount /></div>}
        </div>
      </div>
  );
};

export default HealthAIChat;