import React, { useState, useEffect } from 'react';
import { Package, Calendar, ShoppingBag, Download } from 'lucide-react';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import ReportChart from './ReportChart';
import { exportReportToPdf, exportReportToCsv, downloadBlob } from '../../services/reportService';

const OrderReport = ({ theme, categories = [] }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    status: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'orderDate',
    direction: 'desc'
  });
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 1,
    totalElements: 0
  });
  
  // Prepare table columns for order report
  const columns = [
    { key: 'createdAt', label: 'Order Date', sortable: true, 
      format: (value) => value ? new Date(value).toLocaleDateString() : '' },
    { key: 'customerEmail', label: 'Customer Email', sortable: true },
    { key: 'productName', label: 'Product', sortable: false, 
      format: (value, row) => {
        if (row.items && row.items.length > 0) {
          return row.items.map(item => item.productName).join(', ');
        }
        return '';
      }
    },
    { key: 'quantity', label: 'Quantity', sortable: false, 
      format: (value, row) => {
        if (row.items && row.items.length > 0) {
          return row.items.map(item => item.quantity).join(', ');
        }
        return '';
      }
    },
    { key: 'finalAmount', label: 'Final Amount', sortable: true, 
      format: (value) => `Rs ${parseFloat(value).toFixed(2)}` },
    { key: 'status', label: 'Status', sortable: true,
      format: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'DELIVERED' ? 'bg-green-100 text-green-800' :
          value === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
          value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          value === 'CANCELLED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'paymentMethod', label: 'Payment Method', sortable: true },
  ];
  
  // Load report data when filters or pagination change
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        // Get token from localStorage (or your auth provider)
        const token = localStorage.getItem('token');
        const response = await fetch('/api/report/orders' +
          (Object.keys(params).length > 0
            ? '?' + new URLSearchParams(params).toString()
            : ''),
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : undefined,
              'Accept': 'application/json'
            }
          }
        );
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setReportData(data);
        } catch (jsonError) {
          console.error('Order report API did not return valid JSON:', text);
          throw new Error('Order report API did not return valid JSON');
        }
      } catch (error) {
        console.error('Failed to fetch order report:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name === 'status') setPagination(prev => ({ ...prev, page: 0 })); // Reset page on filter
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
  
  // Prepare chart data - orders by status
  const chartData = React.useMemo(() => {
    if (!sortedData || sortedData.length === 0) return {};
    
    // Count orders by status
    const statusCounts = {};
    sortedData.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    const statusLabels = Object.keys(statusCounts);
    const statusData = statusLabels.map(label => statusCounts[label]);
    
    // Colors for different statuses
    const backgroundColors = [
      'rgba(34, 197, 94, 0.6)',  // green - delivered
      'rgba(59, 130, 246, 0.6)', // blue - processing
      'rgba(234, 179, 8, 0.6)',  // yellow - pending
      'rgba(239, 68, 68, 0.6)',  // red - cancelled
      'rgba(148, 163, 184, 0.6)' // gray - other
    ];
    
    return {
      labels: statusLabels,
      datasets: [
        {
          label: 'Orders by Status',
          data: statusData,
          backgroundColor: backgroundColors.slice(0, statusLabels.length),
          borderWidth: 1
        }
      ]
    };
  }, [sortedData]);
  
  // Calculate summary metrics
  const getSummaryMetrics = () => {
    if (!reportData || reportData.length === 0) return {
      totalOrders: 0,
      totalAmount: 0,
      avgOrderValue: 0,
      deliveredCount: 0
    };
    
    const totalOrders = reportData.length;
    const totalAmount = reportData.reduce((sum, item) => sum + Number(item.totalAmount), 0);
    const avgOrderValue = totalOrders ? totalAmount / totalOrders : 0;
    const deliveredCount = reportData.filter(item => item.status === 'Delivered').length;
    
    return {
      totalOrders,
      totalAmount: totalAmount.toFixed(2),
      avgOrderValue: avgOrderValue.toFixed(2),
      deliveredCount
    };
  };
  
  // Handle export to PDF
  const handleExportPdf = async () => {
    try {
      setLoading(true);
      const blob = await exportReportToPdf('orders', filters);
      downloadBlob(blob, `order-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
      const blob = await exportReportToCsv('orders', filters);
      downloadBlob(blob, `order-report-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const metrics = getSummaryMetrics();
  
  // Add renderExpandedRow function
  const renderExpandedRow = (order) => {
    if (!order.items || order.items.length === 0) {
      return (
        <div className="p-4 text-gray-500">No item details available for this order.</div>
      );
    }
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900">
        <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Order Items</h4>
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-3 py-2 border">Product</th>
              <th className="px-3 py-2 border">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 border">{item.productName}</td>
                <td className="px-3 py-2 border">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Order status options for dropdown
  const orderStatusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];
  
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Order Detail Report
      </h2>
      
      <ReportFilters
        reportType="orders"
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onApplyFilters={() => {}} // Automatic
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        theme={theme}
        // Use improved status options for dropdown
        statusOptions={orderStatusOptions}
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'} mr-4`}>
              <ShoppingBag size={24} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Orders</p>
              <p className="text-2xl font-semibold">{metrics.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} mr-4`}>
              <Package size={24} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Delivered Orders</p>
              <p className="text-2xl font-semibold">{metrics.deliveredCount}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'} mr-4`}>
              <Download size={24} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Amount</p>
              <p className="text-2xl font-semibold">Rs {metrics.totalAmount}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-orange-900' : 'bg-orange-100'} mr-4`}>
              <Calendar size={24} className={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Avg Order Value</p>
              <p className="text-2xl font-semibold">Rs {metrics.avgOrderValue}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="mb-6">
        <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Orders by Status
        </h3>
        <ReportChart 
          type="pie"
          data={chartData}
          theme={theme}
          height={300}
        />
      </div>
      
      {/* Table */}
      <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Order Details
      </h3>
      <ReportTable
        data={sortedData}
        columns={columns}
        loading={loading}
        sortConfig={sortConfig}
        onSort={handleSort}
        theme={theme}
        expandedRowId={expandedRowId}
        renderExpandedRow={renderExpandedRow}
        // Pagination handlers removed since API does not support pagination
      />
    </div>
  );
};

export default OrderReport;