import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Calendar } from 'lucide-react';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import ReportChart from './ReportChart';
import { getSalesReport, exportReportToPdf, exportReportToCsv, downloadBlob } from '../../services/reportService';

const SalesReport = ({ theme, categories = [] }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  
  // Prepare table columns for sales report
  const columns = [
    { key: 'date', label: 'Date', sortable: true, 
      format: (value) => new Date(value).toLocaleDateString() },
    { key: 'orderCount', label: 'Orders', sortable: true },
    { key: 'sales', label: 'Sales Amount', sortable: true, 
      format: (value) => `$${parseFloat(value).toFixed(2)}` },
    { key: 'itemsSold', label: 'Items Sold', sortable: true },
    { key: 'avgOrderValue', label: 'Avg Order Value', sortable: true,
      format: (value) => `$${parseFloat(value).toFixed(2)}` },
  ];
  
  // Load report data when filters change
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await getSalesReport(filters);
        setReportData(response);
      } catch (error) {
        console.error('Failed to fetch sales report:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
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
    
    // Slice to get the last 30 days (most recent first)
    const slicedData = [...sortedData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    ).slice(0, 30).reverse();
    
    return {
      labels: slicedData.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Sales ($)',
          data: slicedData.map(item => item.sales),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true
        },
        {
          label: 'Orders',
          data: slicedData.map(item => item.orderCount),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: true
        }
      ]
    };
  }, [sortedData]);
  
  // Calculate summary metrics
  const getSummaryMetrics = () => {
    if (!reportData || reportData.length === 0) return {
      totalSales: 0,
      totalOrders: 0,
      totalItems: 0,
      avgOrderValue: 0
    };
    
    const totalSales = reportData.reduce((sum, item) => sum + Number(item.sales), 0);
    const totalOrders = reportData.reduce((sum, item) => sum + Number(item.orderCount), 0);
    const totalItems = reportData.reduce((sum, item) => sum + Number(item.itemsSold), 0);
    const avgOrderValue = totalOrders ? totalSales / totalOrders : 0;
    
    return {
      totalSales: totalSales.toFixed(2),
      totalOrders,
      totalItems,
      avgOrderValue: avgOrderValue.toFixed(2)
    };
  };
  
  // Handle export to PDF
  const handleExportPdf = async () => {
    try {
      setLoading(true);
      const blob = await exportReportToPdf('sales', filters);
      downloadBlob(blob, `sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle export to CSV
  const handleExportCsv = async () => {
    try {
      setLoading(true);
      const blob = await exportReportToCsv('sales', filters);
      downloadBlob(blob, `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const metrics = getSummaryMetrics();
  
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Sales Report
      </h2>
      
      <ReportFilters
        reportType="sales"
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onApplyFilters={() => {}} // Automatic
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        theme={theme}
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'} mr-4`}>
              <DollarSign size={24} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Sales</p>
              <p className="text-2xl font-semibold">${metrics.totalSales}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} mr-4`}>
              <ShoppingBag size={24} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Orders</p>
              <p className="text-2xl font-semibold">{metrics.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'} mr-4`}>
              <TrendingUp size={24} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Avg Order Value</p>
              <p className="text-2xl font-semibold">${metrics.avgOrderValue}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-orange-900' : 'bg-orange-100'} mr-4`}>
              <Calendar size={24} className={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Items Sold</p>
              <p className="text-2xl font-semibold">{metrics.totalItems}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="mb-6">
        <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Sales Trend
        </h3>
        <ReportChart 
          type="line"
          data={chartData}
          theme={theme}
          height={300}
        />
      </div>
      
      {/* Table */}
      <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Sales Details
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

export default SalesReport; 