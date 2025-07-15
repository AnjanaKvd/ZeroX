import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getCategories } from '../../services/categoryService';

/**
 * ReportFilters component for filtering reports by date, category, etc.
 */
const ReportFilters = ({ 
  reportType,
  filters,
  statusOptions = [],
  onFilterChange,
  onApplyFilters,
  onExportPdf,
  onExportCsv,
  theme 
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setCategoryError(null);
        const response = await getCategories();
        setCategories(response || []);
      } catch (error) {
        setCategoryError("Failed to load categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

  // Helper function to determine the category ID property name
  const getCategoryIdProperty = () => {
    if (categories.length === 0) return 'id';
    const category = categories[0];
    // Check possible property names that could contain the UUID
    if (category.categoryId !== undefined) return 'categoryId';
    if (category.id !== undefined) return 'id';
    if (category.uuid !== undefined) return 'uuid';
    // Default fallback
    return Object.keys(category).find(key => 
      typeof category[key] === 'string' && 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category[key])
    ) || 'id';
  };

  // Get the appropriate category ID property
  const categoryIdProperty = getCategoryIdProperty();

  // Get the appropriate category name property
  const getCategoryNameProperty = () => {
    if (categories.length === 0) return 'name';
    const category = categories[0];
    return category.name !== undefined ? 'name' : 
           category.categoryName !== undefined ? 'categoryName' : 'name';
  };

  const categoryNameProperty = getCategoryNameProperty();

  // Simplified layout for inventory report
  if (reportType === 'inventory') {
    return (
      <div className="mb-6">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className={`block text-sm font-medium mb-2 ${colors.text}`}>
              Category
            </label>
            {loading ? (
              <div className={`w-full rounded-md border px-3 py-2 ${colors.select} h-11 flex items-center`}>
                Loading categories...
              </div>
            ) : categoryError ? (
              <div className="text-red-500 text-sm">{categoryError}</div>
            ) : (
            <select
              id="category"
              name="category"
              value={filters.category || ''}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 ${colors.select} h-11`}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                  <option 
                    key={category[categoryIdProperty]} 
                    value={category[categoryIdProperty]}
                  >
                    {category[categoryNameProperty]}
                </option>
              ))}
            </select>
            )}
          </div>

          {/* Stock Level Filter */}
          <div>
            <label htmlFor="lowStock" className={`block text-sm font-medium mb-2 ${colors.text}`}>
              Stock Level
            </label>
            <select
              id="lowStock"
              name="lowStock"
              value={String(filters.lowStock)}
              onChange={(e) => {
                // Convert to boolean
                const value = e.target.value === 'true';
                handleChange({
                  target: { name: 'lowStock', value }
                });
              }}
              className={`w-full rounded-md border px-3 py-2 ${colors.select} h-11`}
            >
              <option value="false">All Items</option>
              <option value="true">Low Stock Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onApplyFilters}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-5 rounded"
          >
            Apply Filters
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={onExportPdf}
              className="flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded"
            >
              <Download size={16} />
              <span>PDF</span>
            </button>
            
            <button
              onClick={onExportCsv}
              className="flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded"
            >
              <Download size={16} />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Original layout for other report types
  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 mb-6`}>
      <div className="mb-4">
        <h3 className={`text-lg font-medium mb-2 ${colors.text}`}>Report Filters</h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Customize your report by selecting the filters below
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filters - For Sales, Customer, and Order Reports */}
        {(reportType === 'sales' || reportType === 'customers' || reportType === 'orders') && (
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
        
        {/* Category Filter - For Sales Reports Only */}
        {reportType === 'sales' && (
          <div>
            <label htmlFor="category" className={`block text-sm font-medium mb-1 ${colors.text}`}>
              Category
            </label>
            {loading ? (
              <div className={`w-full rounded-md border px-3 py-2 ${colors.select} flex items-center`}>
                Loading categories...
              </div>
            ) : categoryError ? (
              <div className="text-red-500 text-sm">{categoryError}</div>
            ) : (
            <select
              id="category"
              name="category"
              value={filters.category || ''}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 ${colors.select}`}
            >
              <option value="">All Categories</option>
                {categories.map(category => (
                <option 
                    key={category[categoryIdProperty]} 
                    value={category[categoryIdProperty]}
                >
                    {category[categoryNameProperty]}
                </option>
              ))}
            </select>
            )}
          </div>
        )}

        {/* Status Filter - For Order and Sales Reports */}
        {(reportType === 'orders' || reportType === 'sales') && statusOptions.length > 0 && (
          <div>
            <label htmlFor="status" className={`block text-sm font-medium mb-1 ${colors.text}`}>
              {reportType === 'orders' ? 'Order Status' : 'Sales Filter'}
            </label>
            <select
              id="status"
              name="status"
              value={filters.status || ''}
              onChange={handleChange}
              className={`w-full rounded-md border px-3 py-2 ${colors.select}`}
              disabled={reportType === 'sales' && statusOptions.length === 1}
            >
              {statusOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {onApplyFilters && (
          <button
            onClick={() => onApplyFilters(filters)}
            className={`px-4 py-2 text-white rounded-md ${colors.buttonPrimary}`}
          >
            Apply Filters
          </button>
        )}

        <div className="flex gap-2 ml-auto">
          <button
            onClick={onExportPdf}
            className={`flex items-center px-3 py-2 rounded-md ${colors.buttonSecondary}`}
          >
            <Download size={16} className="mr-1" />
            Export PDF
          </button>
          
          <button
            onClick={onExportCsv}
            className={`flex items-center px-3 py-2 rounded-md ${colors.buttonSecondary}`}
          >
            <Download size={16} className="mr-1" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;