import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './QuickActionCard.css';

const QuickActionCard = ({ to, icon, title, description, color, gradient }) => {
  const iconRef = useRef(null);

  useEffect(() => {
    // Initialize Feather Icons
    if (window.feather && iconRef.current) {
      window.feather.replace();
    }
  }, [icon]);

  const cardStyle = {
    background: gradient || `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
    borderColor: `${color}40`,
  };

  const iconStyle = {
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
  };

  return (
    <Link to={to} className="quick-action-card" style={cardStyle}>
      <div className="quick-action-icon" style={iconStyle} ref={iconRef}>
        <i data-feather={icon} style={{ width: '24px', height: '24px', color: 'white' }}></i>
      </div>
      <div className="quick-action-content">
        <h3 className="quick-action-title">{title}</h3>
        <p className="quick-action-description">{description}</p>
      </div>
      <div className="quick-action-arrow">→</div>
    </Link>
  );
};

export default QuickActionCard;

