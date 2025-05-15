import React from 'react';
import { ArrowDownTray } from 'lucide-react';

/**
 * ReportFilters component for filtering reports by date, category, etc.
 */
const ReportFilters = ({ 
  reportType,
  filters,
  categories = [],
  onFilterChange,
  onApplyFilters,
  onExportPdf,
  onExportCsv,
  theme 
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  // Determine component colors based on theme
  const colors = theme === 'dark' 
    ? {
        bg: 'bg-gray-800',
        border: 'border-gray-700',
        text: 'text-white',
        input: 'bg-gray-700 border-gray-600 text-white',
        select: 'bg-gray-700 border-gray-600 text-white',
        buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
        buttonSecondary: 'bg-gray-700 hover:bg-gray-600 text-white'
      }
    : {
        bg: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-800',
        input: 'bg-white border-gray-300 text-gray-900',
        select: 'bg-white border-gray-300 text-gray-900',
        buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
        buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 mb-6`}>
      <div className="mb-4">
        <h3 className={`text-lg font-medium mb-2 ${colors.text}`}>Report Filters</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Customize your report by selecting the filters below
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filters - For Sales and Customer Reports */}
        {(reportType === 'sales' || reportType === 'customers') && (
          <>
            <div>
              <label htmlFor="startDate" className={`block text-sm font-medium mb-1 ${colors.text}`}>
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate || ''}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 ${colors.input}`}
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className={`block text-sm font-medium mb-1 ${colors.text}`}>
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate || ''}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 ${colors.input}`}
              />
            </div>
          </>
        )}
        
        {/* Category Filter - For All Reports */}
        <div>
          <label htmlFor="category" className={`block text-sm font-medium mb-1 ${colors.text}`}>
            Category
          </label>
          <select
            id="category"
            name="category"
            value={filters.category || ''}
            onChange={handleChange}
            className={`w-full rounded-md border px-3 py-2 ${colors.select}`}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Low Stock Filter - For Inventory Report */}
        {reportType === 'inventory' && (
          <div>
            <label htmlFor="lowStock" className={`block text-sm font-medium mb-1 ${colors.text}`}>
              Stock Level
            </label>
            <select
              id="lowStock"
              name="lowStock"
              value={filters.lowStock || ''}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 ${colors.select}`}
            >
              <option value="">All Items</option>
              <option value="true">Low Stock Only</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onApplyFilters}
          className={`px-4 py-2 text-white rounded-md ${colors.buttonPrimary}`}
        >
          Apply Filters
        </button>

        <div className="flex gap-2">
          <button
            onClick={onExportPdf}
            className={`flex items-center px-3 py-2 rounded-md ${colors.buttonSecondary}`}
          >
            <ArrowDownTray size={16} className="mr-1" />
            Export PDF
          </button>
          
          <button
            onClick={onExportCsv}
            className={`flex items-center px-3 py-2 rounded-md ${colors.buttonSecondary}`}
          >
            <ArrowDownTray size={16} className="mr-1" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters; 