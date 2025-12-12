const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div style={{
      padding: '16px 20px',
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '12px',
      color: '#f87171',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.95rem',
      fontWeight: '500'
    }}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#f87171',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0 10px',
            lineHeight: '1',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.7'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

