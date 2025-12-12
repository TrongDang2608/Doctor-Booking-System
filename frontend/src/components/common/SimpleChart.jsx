import React from 'react';
import './SimpleChart.css';

const SimpleChart = ({ data, type = 'line', color = '#3b82f6', height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="simple-chart-empty" style={{ height }}>
        <p>Không có dữ liệu</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  
  // Chart dimensions in pixels
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = 400; // Base width for calculations
  const chartHeight = height - paddingTop - paddingBottom;
  const usableWidth = chartWidth - paddingLeft - paddingRight;

  const getBarHeight = (value) => {
    if (maxValue === minValue) return 20;
    return ((value - minValue) / (maxValue - minValue)) * chartHeight;
  };

  const getLineY = (value) => {
    if (maxValue === minValue) return paddingTop + chartHeight / 2;
    return paddingTop + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
  };

  const getBarX = (index) => {
    const barSpacing = usableWidth / data.length;
    const barWidth = barSpacing * 0.65; // 65% for bar, 35% for gap
    const startX = paddingLeft + (barSpacing - barWidth) / 2;
    return startX + index * barSpacing;
  };

  const getLineX = (index) => {
    if (data.length === 1) return paddingLeft + usableWidth / 2;
    const spacing = usableWidth / (data.length - 1);
    return paddingLeft + index * spacing;
  };

  return (
    <div className="simple-chart" style={{ height }}>
      <svg width="100%" height={height} className="chart-svg" viewBox={`0 0 ${chartWidth} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight - ratio * chartHeight;
          return (
            <line
              key={ratio}
              x1={paddingLeft}
              y1={y}
              x2={paddingLeft + usableWidth}
              y2={y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Chart content */}
        {type === 'bar' ? (
          // Bar chart
          data.map((item, index) => {
            const barHeight = getBarHeight(item.value);
            const barWidth = (usableWidth / data.length) * 0.65;
            const x = getBarX(index);
            const y = paddingTop + chartHeight - barHeight;
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  rx="3"
                  className="chart-bar"
                  opacity="0.85"
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  fill="#94A3B8"
                  fontSize="11"
                  textAnchor="middle"
                  className="chart-label"
                >
                  {item.label}
                </text>
                {item.value > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    fill="#e0e0e0"
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="middle"
                    className="chart-value"
                  >
                    {item.value}
                  </text>
                )}
              </g>
            );
          })
        ) : (
          // Line chart
          <>
            <polyline
              points={data.map((item, index) => {
                const x = getLineX(index);
                const y = getLineY(item.value);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              className="chart-line"
            />
            {data.map((item, index) => {
              const x = getLineX(index);
              const y = getLineY(item.value);
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill={color}
                    stroke="#fff"
                    strokeWidth="1.5"
                    className="chart-point"
                  />
                  <text
                    x={x}
                    y={height - 10}
                    fill="#94A3B8"
                    fontSize="11"
                    textAnchor="middle"
                    className="chart-label"
                  >
                    {item.label}
                  </text>
                  {item.value > 0 && (
                    <text
                      x={x}
                      y={y - 10}
                      fill="#e0e0e0"
                      fontSize="12"
                      fontWeight="600"
                      textAnchor="middle"
                      className="chart-value"
                    >
                      {item.value}
                    </text>
                  )}
                </g>
              );
            })}
          </>
        )}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const value = Math.round(minValue + ratio * (maxValue - minValue));
          const y = paddingTop + chartHeight - ratio * chartHeight;
          return (
            <text
              key={ratio}
              x={paddingLeft - 8}
              y={y + 4}
              fill="#94A3B8"
              fontSize="10"
              textAnchor="end"
            >
              {value}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default SimpleChart;
