import { useState, useEffect } from 'react';
import { symptoms, chatHistory, symptomPatterns, specialtyMapping } from '../../mockData/patient/aiSymptomChecker';
import './AISymptomChecker.css';

const AISymptomChecker = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedSpecialties, setSuggestedSpecialties] = useState([]);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        message: 'Xin chào! Tôi là trợ lý sức khỏe AI. Hãy mô tả triệu chứng của bạn để tôi có thể hỗ trợ tìm chuyên khoa phù hợp.',
        timestamp: new Date().toISOString()
      }
    ]);

    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const findMatchingSymptoms = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    const matchedSymptoms = symptoms.filter(symptom =>
      symptom.name.toLowerCase().includes(lowerInput) ||
      symptom.relatedSymptoms.some(rel => rel.toLowerCase().includes(lowerInput))
    );

    // Also check patterns
    const matchedPatterns = symptomPatterns.filter(pattern =>
      pattern.pattern.some(p => lowerInput.includes(p.toLowerCase()))
    );

    return { matchedSymptoms, matchedPatterns };
  };

  const generateAIResponse = (userInput) => {
    const { matchedSymptoms, matchedPatterns } = findMatchingSymptoms(userInput);
    
    if (matchedSymptoms.length > 0) {
      const primarySymptom = matchedSymptoms[0];
      const specialties = primarySymptom.suggestedSpecialties;
      setSuggestedSpecialties(specialties);
      
      return {
        message: primarySymptom.aiResponse,
        recommendations: specialties.map(specialty => ({
          specialty,
          urgency: primarySymptom.urgency,
          action: primarySymptom.urgency === 'urgent' ? 'Đặt lịch ngay' : 'Đặt lịch'
        }))
      };
    }

    if (matchedPatterns.length > 0) {
      const pattern = matchedPatterns[0];
      const specialties = pattern.recommendedAction.includes('Tiêu hóa') ? ['Tiêu hóa'] :
                         pattern.recommendedAction.includes('Thần kinh') ? ['Thần kinh'] :
                         pattern.recommendedAction.includes('Hô hấp') ? ['Hô hấp'] : ['Nội tổng quát'];
      
      setSuggestedSpecialties(specialties);
      
      return {
        message: `Dựa trên triệu chứng bạn mô tả, ${pattern.recommendedAction}. Các tình trạng có thể gặp: ${pattern.possibleConditions.join(', ')}.`,
        recommendations: specialties.map(specialty => ({
          specialty,
          urgency: pattern.urgency,
          action: 'Đặt lịch'
        }))
      };
    }

    // Default response
    setSuggestedSpecialties(['Nội tổng quát']);
    return {
      message: 'Cảm ơn bạn đã mô tả triệu chứng. Để được chẩn đoán chính xác, bạn nên đặt lịch khám với bác sĩ. Chúng tôi có thể giúp bạn tìm bác sĩ phù hợp.',
      recommendations: [
        { specialty: 'Nội tổng quát', urgency: 'normal', action: 'Đặt lịch' }
      ]
    };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: aiResponse.message,
        recommendations: aiResponse.recommendations,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-symptom-checker">
      <div className="ai-checker-header">
        <h2>Trợ lý Sức khỏe AI</h2>
        <p>Mô tả triệu chứng của bạn để được tư vấn chuyên khoa phù hợp</p>
      </div>

      <div className="ai-chat-container">
        <div className="ai-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-message ${msg.type}`}>
              <div className="ai-message-content">
                {msg.type === 'bot' && (
                  <div className="ai-avatar">🤖</div>
                )}
                <div className="ai-message-text">
                  <p>{msg.message}</p>
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="ai-recommendations">
                      {msg.recommendations.map((rec, idx) => (
                        <button
                          key={idx}
                          className={`ai-recommendation-btn ${rec.urgency}`}
                        >
                          {rec.specialty} - {rec.action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span className="ai-message-time">
                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="ai-message bot">
              <div className="ai-message-content">
                <div className="ai-avatar">🤖</div>
                <div className="ai-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ai-input-container">
          <textarea
            className="ai-input"
            placeholder="Mô tả triệu chứng của bạn... (VD: Tôi bị đau bụng dưới bên phải, sốt nhẹ)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
          />
          <button
            className="ai-send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
          >
            <i data-feather="send"></i>
          </button>
        </div>
      </div>

      {suggestedSpecialties.length > 0 && (
        <div className="ai-suggested-specialties">
          <h3>Chuyên khoa được đề xuất:</h3>
          <div className="specialty-tags">
            {suggestedSpecialties.map((specialty, idx) => (
              <span key={idx} className="specialty-tag">{specialty}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISymptomChecker;

