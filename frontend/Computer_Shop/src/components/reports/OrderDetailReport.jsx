import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Package, Calendar, ShoppingBag, Download, TrendingUp, Clock } from 'lucide-react';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import ReportChart from './ReportChart';
import { exportReportToPdf, exportReportToCsv, downloadBlob } from '../../services/reportService';
import { getAddressById } from '../../services/addressService';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';

const OrderDetailReport = ({ theme, categories = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const [expandedRowData, setExpandedRowData] = useState({});

  // Define status options for the filter
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  // Prepare table columns for order report
  const columns = [
    { key: 'orderDate', label: 'Order Date', sortable: true, 
      format: (value) => new Date(value).toLocaleDateString() },
    { key: 'orderId', label: 'Order ID', sortable: true, 
      format: (value, row) => (
        <button
          className="text-blue-600 underline hover:text-blue-800 focus:outline-none"
          onClick={() => handleRowExpand(row)}
        >
          {value}
        </button>
      )
    },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'totalAmount', label: 'Amount', sortable: true, 
      format: (value) => `Rs ${parseFloat(value).toFixed(2)}` },
    { key: 'itemCount', label: 'Items', sortable: true },
    { key: 'status', label: 'Status', sortable: true,
      format: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    { key: 'deliveryDate', label: 'Delivery Date', sortable: true,
      format: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
  ];

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Load report data when filters change
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state before fetching
        
        // Use direct API endpoint as requested
        const response = await api.get('/orders');
        const orders = response.data || [];
        
        // Transform the order data into the format expected by the order report
        const transformedOrders = orders.map(order => {
          try {
            // Calculate item count
            const itemCount = order.items ? order.items.reduce((sum, item) => 
              sum + (item.quantity || 0), 0) : 0;
            
            // Format the order date
            const orderDate = order.createdAt || order.orderDate || new Date().toISOString();
            
            // Format delivery date if available
            let deliveryDate = null;
            if (order.status === 'DELIVERED' && order.updatedAt) {
              deliveryDate = order.updatedAt;
            }
            
            return {
              orderId: order.orderId,
              orderDate: orderDate,
              customerName: order.customerName || (order.user ? order.user.name : 'Unknown'),
              customerEmail: order.customerEmail || (order.user ? order.user.email : ''),
              customerPhone: order.customerPhone || '',
              totalAmount: order.finalAmount || order.totalAmount || 0,
              itemCount: itemCount,
              status: order.status || 'Pending',
              deliveryDate: deliveryDate,
              items: order.items || [],
              shippingAddressId: order.shippingAddressId || null
            };
          } catch (err) {
            // Return a minimal valid order object to prevent the entire process from failing
            return {
              orderId: order.orderId || 'unknown',
              orderDate: new Date().toISOString(),
              customerName: 'Error processing order',
              totalAmount: 0,
              itemCount: 0,
              status: 'Error',
              items: []
            };
          }
        });
        
        // Apply filters on the client side
        const filteredOrders = transformedOrders.filter(order => {
          try {
            // Filter by date range
            if (filters.startDate && filters.endDate) {
              const orderDate = new Date(order.orderDate);
              const startDate = new Date(filters.startDate);
              const endDate = new Date(filters.endDate);
              
              // Set time to beginning/end of day for accurate comparison
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(23, 59, 59, 999);
              
              if (orderDate < startDate || orderDate > endDate) {
                return false;
              }
            }
            
            // Filter by status
            if (filters.status && order.status) {
              if (order.status.toLowerCase() !== filters.status.toLowerCase()) {
                return false;
              }
            }
            
            // Filter by category (if implemented in the future)
            if (filters.category && order.items && order.items.length > 0) {
              // This would require category information in the order items
              // For now, we'll skip this filter as it's not fully implemented
            }
            
            return true;
          } catch (err) {
            return false; // Skip this order if filtering fails
          }
        });
        
        // Normalize status values to title case
        const normalizedData = filteredOrders.map(order => ({
          ...order,
          status: normalizeStatus(order.status)
        }));
        
        setReportData(normalizedData);
      } catch (error) {
        setError('Failed to fetch order data. Please try again later.');
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [filters]);

  // Helper function to normalize status values
  const normalizeStatus = (status) => {
    try {
      if (!status) return 'Pending';
      
      // Ensure status is a string
      const statusStr = String(status);
      
      // Convert to lowercase first, then capitalize first letter
      const lowercase = statusStr.toLowerCase();
      return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
    } catch (error) {
      return 'Pending';
    }
  };

  // Debounce function to prevent excessive API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Handle filter changes with debounce
  const handleFilterChange = useCallback(
    debounce((name, value) => {
      setFilters(prev => ({ ...prev, [name]: value }));
    }, 300),
    []
  );

  // Apply sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort data based on sortConfig
  const sortedData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    
    const { key, direction } = sortConfig;
    return [...reportData].sort((a, b) => {
      // Handle different data types appropriately
      if (key === 'orderDate' || key === 'deliveryDate') {
        // Date comparison
        const dateA = a[key] ? new Date(a[key]).getTime() : 0;
        const dateB = b[key] ? new Date(b[key]).getTime() : 0;
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (key === 'totalAmount' || key === 'itemCount') {
        // Numeric comparison
        const numA = parseFloat(a[key]) || 0;
        const numB = parseFloat(b[key]) || 0;
        return direction === 'asc' ? numA - numB : numB - numA;
      } else {
        // String comparison
        const strA = String(a[key] || '').toLowerCase();
        const strB = String(b[key] || '').toLowerCase();
        if (strA < strB) return direction === 'asc' ? -1 : 1;
        if (strA > strB) return direction === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [reportData, sortConfig]);

  // Handle row expansion
  const handleRowExpand = async (row) => {
    const orderId = row.orderId;
    setExpandedRowId(expandedRowId === orderId ? null : orderId);
    
    // If we're expanding and don't have the full data yet, fetch it
    if (expandedRowId !== orderId && row.shippingAddressId && !expandedRowData[orderId]?.shippingAddress) {
      try {
        const address = await getAddressById(row.shippingAddressId);
        setExpandedRowData(prev => ({
          ...prev,
          [orderId]: {
            ...prev[orderId],
            shippingAddress: address
          }
        }));
      } catch (err) {
      }
    }
  };

  // Render expanded row content
  const renderExpandedRow = (row) => {
    if (!expandedRowId || expandedRowId !== row.orderId) return null;
    
    const addressData = expandedRowData[row.orderId]?.shippingAddress;
    const isLoadingAddress = row.shippingAddressId && !addressData;
    
    return (
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
            <div className="space-y-2">
              {row.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${row.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`${getStatusColor(row.status)} px-2 py-0.5 rounded-full text-xs`}>
                  {row.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span>{new Date(row.orderDate).toLocaleString()}</span>
              </div>
              {row.deliveryDate && (
                <div className="flex justify-between">
                  <span>Delivery Date:</span>
                  <span>{new Date(row.deliveryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Shipping Address</h4>
            {isLoadingAddress ? (
              <div className="flex items-center justify-center py-2">
                <LoadingSpinner size="small" />
              </div>
            ) : addressData ? (
              <div className="text-sm space-y-1">
                <p className="font-medium">{addressData.fullName}</p>
                <p>{addressData.addressLine1}</p>
                {addressData.addressLine2 && <p>{addressData.addressLine2}</p>}
                <p>{addressData.city}, {addressData.state} {addressData.zipCode}</p>
                <p>{addressData.country}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No shipping address available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Prepare chart data - orders by status
  const statusChartData = useMemo(() => {
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
      'rgba(168, 85, 247, 0.6)', // purple - shipped
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

  // Prepare chart data - orders over time
  const timeChartData = useMemo(() => {
    if (!sortedData || sortedData.length === 0) return {};
    
    // Group orders by date
    const ordersByDate = {};
    sortedData.forEach(order => {
      const date = new Date(order.orderDate).toISOString().split('T')[0];
      if (!ordersByDate[date]) {
        ordersByDate[date] = {
          total: 0,
          statuses: {}
        };
      }
      ordersByDate[date].total += 1;
      
      // Count by status
      if (!ordersByDate[date].statuses[order.status]) {
        ordersByDate[date].statuses[order.status] = 0;
      }
      ordersByDate[date].statuses[order.status] += 1;
    });
    
    // Sort dates
    const sortedDates = Object.keys(ordersByDate).sort();
    
    // Get unique statuses
    const allStatuses = new Set();
    sortedData.forEach(order => allStatuses.add(order.status));
    const uniqueStatuses = Array.from(allStatuses);
    
    // Prepare datasets for each status
    const datasets = uniqueStatuses.map(status => {
      // Get color for this status
      const getColor = (status) => {
        switch(status) {
          case 'Delivered': return 'rgba(34, 197, 94, 0.6)';
          case 'Processing': return 'rgba(59, 130, 246, 0.6)';
          case 'Pending': return 'rgba(234, 179, 8, 0.6)';
          case 'Shipped': return 'rgba(168, 85, 247, 0.6)';
          case 'Cancelled': return 'rgba(239, 68, 68, 0.6)';
          default: return 'rgba(148, 163, 184, 0.6)';
        }
      };
      
      return {
        label: status,
        data: sortedDates.map(date => ordersByDate[date].statuses[status] || 0),
        backgroundColor: getColor(status),
        borderColor: getColor(status).replace('0.6', '1'),
        borderWidth: 1
      };
    });
    
    return {
      labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
      datasets
    };
  }, [sortedData]);

  // Calculate summary metrics
  const getSummaryMetrics = () => {
    if (!reportData || reportData.length === 0) return {
      totalOrders: 0,
      totalAmount: 0,
      avgOrderValue: 0,
      deliveredCount: 0,
      pendingCount: 0,
      processingCount: 0
    };
    
    const totalOrders = reportData.length;
    const totalAmount = reportData.reduce((sum, item) => sum + Number(item.totalAmount), 0);
    const avgOrderValue = totalOrders ? totalAmount / totalOrders : 0;
    const deliveredCount = reportData.filter(item => item.status === 'Delivered').length;
    const pendingCount = reportData.filter(item => item.status === 'Pending').length;
    const processingCount = reportData.filter(item => item.status === 'Processing').length;
    
    return {
      totalOrders,
      totalAmount: totalAmount.toFixed(2),
      avgOrderValue: avgOrderValue.toFixed(2),
      deliveredCount,
      pendingCount,
      processingCount
    };
  };

  // Handle export to PDF
  const handleExportPdf = async () => {
    try {
      setLoading(true);
      const blob = await exportReportToPdf('orders', filters);
      downloadBlob(blob, `order-detail-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Handle export to CSV
  const handleExportCsv = async () => {
    try {
      setLoading(true);
      const blob = await exportReportToCsv('orders', filters);
      downloadBlob(blob, `order-detail-report-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const metrics = getSummaryMetrics();

  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Order Detail Report
      </h2>
      
      <ReportFilters
        reportType="orders"
        filters={filters}
        categories={categories}
        statusOptions={statusOptions}
        onFilterChange={handleFilterChange}
        onApplyFilters={() => {}} // Automatic
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        theme={theme}
      />
      
      {/* Error Message */}
      {error && (
        <div className={`p-4 mb-6 rounded-lg ${theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'} border ${theme === 'dark' ? 'border-red-800' : 'border-red-200'}`}>
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-1">
            Please check your network connection and try again. If the problem persists, contact support.
          </p>
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`}></div>
        </div>
      )}
      
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
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100'} mr-4`}>
              <Clock size={24} className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Pending Orders</p>
              <p className="text-2xl font-semibold">{metrics.pendingCount}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'} mr-4`}>
              <TrendingUp size={24} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Revenue</p>
              <p className="text-2xl font-semibold">Rs {metrics.totalAmount}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      {!loading && !error && sortedData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Orders by Status
            </h3>
            <ReportChart 
              type="pie"
              data={statusChartData}
              theme={theme}
              height={300}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
          
          <div>
            <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Orders Over Time
            </h3>
            <ReportChart 
              type="bar"
              data={timeChartData}
              theme={theme}
              height={300}
              options={{
                scales: {
                  x: {
                    stacked: true
                  },
                  y: {
                    stacked: true,
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      )}
      
      {/* No Data for Charts */}
      {!loading && !error && sortedData.length === 0 && (
        <div className={`p-6 mb-6 text-center rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
          <TrendingUp size={36} className="mx-auto mb-3 opacity-30" />
          <h3 className="text-lg font-medium mb-2">No Chart Data Available</h3>
          <p>Charts will appear when order data is available.</p>
        </div>
      )}
      
      {/* Table */}
      <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Order Details
      </h3>
      
      {!loading && !error && sortedData.length > 0 && (
        <ReportTable
          data={sortedData}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
          theme={theme}
          expandedRowId={expandedRowId}
          renderExpandedRow={renderExpandedRow}
        />
      )}
      
      {/* No Data Message */}
      {!loading && !error && sortedData.length === 0 && (
        <div className={`p-8 text-center rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
          <p>Try adjusting your filters or check back later for new orders.</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetailReport;