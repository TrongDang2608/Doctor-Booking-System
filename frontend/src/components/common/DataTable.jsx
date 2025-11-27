import React from 'react';

const DataTable = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = 'No data found',
  onRowClick,
  keyExtractor = (item) => item.id
}) => {
  if (loading) {
    return (
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '40px', 
        borderRadius: '12px',
        textAlign: 'center',
        color: '#aaa'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '40px', 
        borderRadius: '12px',
        textAlign: 'center',
        color: '#aaa'
      }}>
        {typeof emptyMessage === 'string' ? <p>{emptyMessage}</p> : emptyMessage}
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
      overflowX: 'auto',
    }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        minWidth: '600px'
      }}>
        <thead>
          <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {columns.map((column, index) => (
              <th
                key={index}
                style={{
                  padding: '15px 12px',
                  textAlign: column.align || 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#e0e0e0',
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'background-color 0.2s',
                cursor: onRowClick ? 'pointer' : 'default',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (onRowClick) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    padding: '15px 12px',
                    textAlign: column.align || 'left',
                    fontSize: '14px',
                    color: '#aaa',
                  }}
                >
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

