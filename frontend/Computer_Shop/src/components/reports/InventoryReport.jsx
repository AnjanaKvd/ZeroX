import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, TrendingDown, Archive } from 'lucide-react';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import ReportChart from './ReportChart';
import { getInventoryReport, exportReportToPdf, exportReportToCsv, downloadBlob } from '../../services/reportService';

const InventoryReport = ({ theme, categories = [] }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    lowStock: false
  });
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    lowStock: false
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'stock',
    direction: 'asc'
  });
  
  // Prepare table columns for inventory report
  const columns = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'brand', label: 'Brand', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'price', label: 'Price', sortable: true,
      format: (value) => `Rs ${parseFloat(value).toFixed(2)}` },
    { key: 'stock', label: 'Stock Level', sortable: true },
    { key: 'stockValue', label: 'Stock Value', sortable: true, 
      format: (value) => `Rs ${parseFloat(value).toFixed(2)}` },
    { key: 'reorderLevel', label: 'Reorder Level', sortable: true },
    { key: 'status', label: 'Status', sortable: true,
      format: (value) => {
        let color;
        let text = value;
        
        if (value === 'In Stock') {
          color = theme === 'dark' ? 'text-green-400' : 'text-green-600';
        } else if (value === 'Low Stock') {
          color = theme === 'dark' ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold';
        } else {
          color = theme === 'dark' ? 'text-red-500 font-bold' : 'text-red-700 font-bold';
        }
        
        return <span className={color}>{text}</span>;
      }
    }
  ];
  
  // Load report data when filters change or on initial render
  useEffect(() => {
    fetchReportData();
  }, [activeFilters]);
  
  // Also fetch on component mount
  useEffect(() => {
    fetchReportData();
  }, []);
  
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await getInventoryReport(activeFilters);
      setReportData(response);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes (doesn't trigger API call)
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Apply filters (triggers API call)
  const handleApplyFilters = () => {
    setActiveFilters({...filters});
  };
  
  // Apply sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Sort data based on sortConfig
  const sortedData = React.useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    
    const { key, direction } = sortConfig;
    return [...reportData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [reportData, sortConfig]);
  
  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!sortedData || sortedData.length === 0) return {};
    
    // Group by category
    const categoryData = sortedData.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      
      if (!acc[category]) {
        acc[category] = {
          totalItems: 0,
          totalValue: 0,
          lowStockItems: 0
        };
      }
      
      acc[category].totalItems += 1;
      acc[category].totalValue += Number(item.stockValue || 0);
      if (item.status === 'Low Stock' || item.status === 'Out of Stock') {
        acc[category].lowStockItems += 1;
      }
      
      return acc;
    }, {});
    
    const categories = Object.keys(categoryData);
    
    return {
      labels: categories,
      datasets: [
        {
          label: 'Stock Value (Rs)',
          data: categories.map(cat => categoryData[cat].totalValue),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#3b82f6',
          borderWidth: 1
        },
        {
          label: 'Low Stock Items',
          data: categories.map(cat => categoryData[cat].lowStockItems),
          backgroundColor: 'rgba(255, 0, 0, 0.8)',  // Bright red color
          borderColor: '#ff0000',
          borderWidth: 1
        }
      ]
    };
  }, [sortedData]);
  
  // Calculate summary metrics
  const getSummaryMetrics = () => {
    if (!reportData || reportData.length === 0) return {
      totalProducts: 0,
      totalStockValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    };
    
    const totalProducts = reportData.length;
    const totalStockValue = reportData.reduce((sum, item) => sum + Number(item.stockValue || 0), 0);
    const lowStockCount = reportData.filter(item => item.status === 'Low Stock').length;
    const outOfStockCount = reportData.filter(item => item.status === 'Out of Stock').length;
    
    return {
      totalProducts,
      totalStockValue: totalStockValue.toFixed(2),
      lowStockCount,
      outOfStockCount
    };
  };
  
  // Handle export to PDF
  const handleExportPdf = async () => {
    try {
      setLoading(true);
      const blob = await exportReportToPdf('inventory', activeFilters);
      downloadBlob(blob, `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  
  // Handle export to CSV
  const handleExportCsv = async () => {
    try {
      setLoading(true);
      const blob = await exportReportToCsv('inventory', activeFilters);
      downloadBlob(blob, `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  
  const metrics = getSummaryMetrics();
  
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Inventory Report
      </h2>
      
      <ReportFilters
        reportType="inventory"
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        theme={theme}
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'} mr-4`}>
              <Package size={24} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Products</p>
              <p className="text-2xl font-semibold">{metrics.totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} mr-4`}>
              <Archive size={24} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Stock Value</p>
              <p className="text-2xl font-semibold">Rs {metrics.totalStockValue}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100'} mr-4`}>
              <TrendingDown size={24} className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Low Stock Items</p>
              <p className="text-2xl font-semibold">{metrics.lowStockCount}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} mr-4`}>
              <AlertCircle size={24} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Out of Stock</p>
              <p className="text-2xl font-semibold">{metrics.outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="mb-6">
        <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Inventory by Category
        </h3>
        <ReportChart 
          type="bar"
          data={chartData}
          theme={theme}
          height={300}
        />
      </div>
      
      {/* Table */}
      <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Inventory Details
      </h3>
      <ReportTable
        data={sortedData}
        columns={columns}
        loading={loading}
        sortConfig={sortConfig}
        onSort={handleSort}
        theme={theme}
      />
    </div>
  );
};

export default InventoryReport; 