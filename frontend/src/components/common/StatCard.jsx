import React from 'react';

const StatCard = ({ label, value, color, chartType = 'line', onClick }) => {
  // Generate mini chart paths based on type
  const generateChartPath = () => {
    const points = 8;
    const values = Array.from({ length: points }, () => Math.random() * 40 + 30);

    if (chartType === 'line') {
      // Smooth line chart
      const width = 100;
      const height = 40;
      const step = width / (points - 1);

      let path = `M 0,${height - (values[0] / 100) * height}`;
      for (let i = 1; i < points; i++) {
        const x = i * step;
        const y = height - (values[i] / 100) * height;
        const prevX = (i - 1) * step;
        const prevY = height - (values[i - 1] / 100) * height;
        const cpX = prevX + step / 2;
        path += ` Q ${cpX},${prevY} ${x},${y}`;
      }
      return path;
    } else if (chartType === 'bars') {
      // Mini bar chart
      return values.map((v, i) => ({
        height: (v / 100) * 100,
        x: i * 12
      }));
    } else if (chartType === 'dots') {
      // Dot pattern
      return values.map((v, i) => ({
        cy: 40 - (v / 100) * 35,
        cx: i * 12 + 6
      }));
    }
  };

  const chartData = generateChartPath();

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '24px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${color}15`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${color}30`;
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
          e.currentTarget.style.borderColor = `${color}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${color}15`;
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }
      }}
    >
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '120px',
        background: `radial-gradient(ellipse at top left, ${color}15, transparent 60%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Label */}
        <p style={{
          margin: '0 0 12px 0',
          color: '#94A3B8',
          fontSize: '13px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {label}
        </p>

        {/* Value */}
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '36px',
          background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '700',
          letterSpacing: '-0.5px'
        }}>
          {value}
        </h2>

        {/* Mini Chart */}
        <div style={{
          height: '45px',
          marginTop: '8px',
          position: 'relative'
        }}>
          {chartType === 'line' && (
            <svg width="100%" height="45" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area under the line */}
              <path
                d={`${chartData} L 100,45 L 0,45 Z`}
                fill={`url(#gradient-${label})`}
              />
              {/* Line */}
              <path
                d={chartData}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: `drop-shadow(0 0 4px ${color}80)`
                }}
              />
            </svg>
          )}

          {chartType === 'bars' && (
            <svg width="100%" height="45">
              {chartData.map((bar, i) => (
                <rect
                  key={i}
                  x={bar.x + '%'}
                  y={45 - bar.height * 0.4}
                  width="8%"
                  height={bar.height * 0.4}
                  fill={color}
                  opacity={0.3 + (bar.height / 100) * 0.7}
                  rx="2"
                  style={{
                    filter: `drop-shadow(0 0 3px ${color}60)`
                  }}
                />
              ))}
            </svg>
          )}

          {chartType === 'dots' && (
            <svg width="100%" height="45">
              {/* Connection lines */}
              <path
                d={chartData.map((d, i) =>
                  i === 0 ? `M ${d.cx},${d.cy}` : `L ${d.cx},${d.cy}`
                ).join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity="0.3"
              />
              {/* Dots */}
              {chartData.map((dot, i) => (
                <circle
                  key={i}
                  cx={dot.cx}
                  cy={dot.cy}
                  r="3"
                  fill={color}
                  opacity={0.7}
                  style={{
                    filter: `drop-shadow(0 0 4px ${color})`
                  }}
                />
              ))}
            </svg>
          )}

          {chartType === 'wave' && (
            <svg width="100%" height="45">
              <defs>
                <linearGradient id={`wave-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                  <stop offset="50%" stopColor={color} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M0,25 Q15,15 30,25 T60,25 T90,25 T120,25"
                fill="none"
                stroke={`url(#wave-gradient-${label})`}
                strokeWidth="3"
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 6px ${color}60)`
                }}
              />
              <path
                d="M0,30 Q15,38 30,30 T60,30 T90,30 T120,30"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
