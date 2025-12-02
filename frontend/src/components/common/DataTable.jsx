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
      <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
        <div className="text-gray-600 font-medium">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
        <div className="text-gray-600">
          {typeof emptyMessage === 'string' ? <p>{emptyMessage}</p> : emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide"
                  style={{ textAlign: column.align || 'left' }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 text-sm text-gray-900"
                    style={{ textAlign: column.align || 'left' }}
                  >
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;

