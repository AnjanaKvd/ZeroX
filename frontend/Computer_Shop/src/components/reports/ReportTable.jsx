import React from 'react';
import { ArrowUpDown } from 'lucide-react';

/**
 * ReportTable component to display report data in a table format
 */
const ReportTable = ({ 
  data = [], 
  columns = [], 
  loading, 
  sortConfig, 
  onSort,
  theme,
  expandedRowId = null,
  renderExpandedRow = null
}) => {
  // Determine colors based on theme
  const colors = theme === 'dark' 
    ? {
        bg: 'bg-gray-800',
        border: 'border-gray-700',
        headerBg: 'bg-gray-900',
        headerText: 'text-gray-200',
        text: 'text-gray-300',
        rowHover: 'hover:bg-gray-700',
        rowEven: 'bg-gray-800',
        rowOdd: 'bg-gray-850',
        expandedBg: 'bg-gray-750'
      }
    : {
        bg: 'bg-white',
        border: 'border-gray-200',
        headerBg: 'bg-gray-50',
        headerText: 'text-gray-700',
        text: 'text-gray-800',
        rowHover: 'hover:bg-gray-50',
        rowEven: 'bg-white',
        rowOdd: 'bg-gray-50',
        expandedBg: 'bg-gray-100'
      };
  
  const handleSort = (columnKey) => {
    if (onSort && columnKey) {
      onSort(columnKey);
    }
  };

  // Generate a caption for the table based on report data
  const getTableSummary = () => {
    if (!data || data.length === 0) {
      return 'No data available';
    }
    
    return `Showing ${data.length} record${data.length === 1 ? '' : 's'}`;
  };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg shadow-sm overflow-hidden`}>
      {loading ? (
        <div className="py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading report data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center">
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No data available for the selected filters
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={colors.headerBg}>
                <tr>
                  {columns.map((column) => (
                    <th 
                      key={column.key}
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${colors.headerText}`}
                    >
                      {column.sortable ? (
                        <button 
                          className="flex items-center space-x-1 focus:outline-none"
                          onClick={() => handleSort(column.key)}
                        >
                          <span>{column.label}</span>
                          <ArrowUpDown size={14} className={
                            sortConfig?.key === column.key 
                              ? 'text-blue-500' 
                              : 'text-gray-400'
                          } />
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((row, rowIndex) => (
                  <React.Fragment key={row.userId || row.id || `row-${rowIndex}`}>
                    <tr 
                      className={`${rowIndex % 2 === 0 ? colors.rowEven : colors.rowOdd} ${colors.rowHover} ${expandedRowId === row.userId || expandedRowId === row.id || expandedRowId === row.orderId ? 'border-b-0' : ''}`}
                    >
                      {columns.map((column) => (
                        <td 
                          key={`${row.userId || row.id || rowIndex}-${column.key}`}
                          className={`px-6 py-4 whitespace-nowrap text-sm ${colors.text}`}
                        >
                          {column.format ? column.format(row[column.key], row) : row[column.key]}
                        </td>
                      ))}
                    </tr>
                    {/* Expanded Row for Details */}
                    {(expandedRowId === row.userId || expandedRowId === row.id || expandedRowId === row.orderId) && renderExpandedRow && (
                      <tr>
                        <td colSpan={columns.length} className="p-0">
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={`px-6 py-3 ${colors.headerBg} border-t ${colors.border}`}>
            <p className={`text-sm ${colors.headerText}`}>
              {getTableSummary()}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportTable;