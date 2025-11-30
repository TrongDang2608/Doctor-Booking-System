import React from 'react';

const StatCard = ({ label, value, color, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        padding: '25px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s, border-color 0.2s',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '14px', fontWeight: '500' }}>
            {label}
          </p>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '32px', color: color, fontWeight: '600' }}>
            {value}
          </h2>
        </div>
        <div style={{ fontSize: '40px', marginLeft: '15px', opacity: 0.8 }}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;

