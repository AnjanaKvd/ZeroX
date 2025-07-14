import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Calendar } from 'lucide-react';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import ReportChart from './ReportChart';
import api from '../../services/api';
import { getProductStats } from '../../services/productService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const SalesReport = ({ theme, categories: propCategories = [] }) => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    revenue: 0
  });
  
  // Initialize with default date range (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [filters, setFilters] = useState({
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    category: '' // Add category filter
  });
  
  // Track if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  
  // State for table view mode
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'
  
  // Prepare table columns based on view mode
  const getSummaryColumns = () => [
    { key: 'date', label: 'Date', sortable: true, 
      format: (value) => new Date(value).toLocaleDateString() },
    { key: 'orderCount', label: 'Orders', sortable: true },
    { key: 'sales', label: 'Sales Amount', sortable: true, 
      format: (value) => `Rs ${parseFloat(value).toFixed(2)}` },
    { key: 'itemsSold', label: 'Items Sold', sortable: true },
    { key: 'avgOrderValue', label: 'Avg Order Value', sortable: true,
      format: (value) => `Rs ${parseFloat(value).toFixed(2)}` },
  ];
  
  const getDetailedColumns = () => [
    { key: 'date', label: 'Sales Date', sortable: true, 
      format: (value) => new Date(value).toLocaleDateString() },
    { key: 'itemName', label: 'Item Name', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    { key: 'price', label: 'Price', sortable: true,
      format: (value) => `Rs ${parseFloat(value).toFixed(2)}` },
    { key: 'total', label: 'Total Price', sortable: true,
      format: (value) => `Rs ${parseFloat(value).toFixed(2)}` },
  ];
  
  // Determine active columns based on view mode
  const columns = viewMode === 'summary' ? getSummaryColumns() : getDetailedColumns();
  
  // Fetch dashboard stats to ensure matching values
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const stats = await getProductStats();
        setDashboardStats({
          totalSales: stats.totalSales || 0,
          revenue: stats.revenue || 0
        });
      } catch (error) {
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  // Helper function to convert string dates to Date objects for comparison
  const parseDateString = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is 0-indexed in JS Date
  };
  
  // Helper function to check if a date is within a range (inclusive)
  const isDateInRange = (dateStr, startDateStr, endDateStr) => {
    if (!dateStr) return false;
    
    const date = parseDateString(dateStr);
    const startDate = startDateStr ? parseDateString(startDateStr) : null;
    const endDate = endDateStr ? parseDateString(endDateStr) : null;
    
    // Remove time portion for accurate date comparison
    date.setHours(0, 0, 0, 0);
    
    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(0, 0, 0, 0);
    
    // Check if date is within range
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  };
  
  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = {
        status: 'DELIVERED',
        size: 1000 // Get more orders at once
      };
      
      // Add date filters if present
      if (filters.startDate) {
        queryParams.startDate = filters.startDate;
      }
      if (filters.endDate) {
        queryParams.endDate = filters.endDate;
      }
      
      // Add category filter if present
      if (filters.category) {
        queryParams.categoryId = filters.category;
      }
      
      const response = await api.get('/orders', { params: queryParams });
      
      let ordersData = response.data.content || [];
      
      // Apply client-side date filtering as a safety measure
      if (filters.startDate || filters.endDate) {
        ordersData = ordersData.filter(order => {
          // Extract date from order.createdAt (assuming ISO format)
          const orderDate = order.createdAt.split('T')[0];
          return isDateInRange(orderDate, filters.startDate, filters.endDate);
        });
      }
      
      // Apply client-side category filtering if needed
      if (filters.category) {
        ordersData = ordersData.filter(order => {
          return order.items.some(item => item.categoryId === filters.category);
        });
      }
      
      setOrders(ordersData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch orders when component mounts or filters are applied
  useEffect(() => {
    if (filtersApplied) {
      fetchOrders();
      setFiltersApplied(false); // Reset flag after fetch
    }
  }, [filtersApplied]);
  
  // Load initial data when component mounts
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Process orders into sales report data
  useEffect(() => {
    if (!orders || orders.length === 0) {
      setReportData([]);
      return;
    }
    
    if (viewMode === 'summary') {
      // Group orders by date for summary view
      const salesByDate = orders.reduce((acc, order) => {
        // Format date to YYYY-MM-DD for grouping
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        
        // Verify that this date is within our filter range
        if (filters.startDate || filters.endDate) {
          if (!isDateInRange(orderDate, filters.startDate, filters.endDate)) {
            return acc; // Skip this order if outside date range
          }
        }
        
        if (!acc[orderDate]) {
          acc[orderDate] = {
            date: orderDate,
            orderCount: 0,
            sales: 0,
            itemsSold: 0,
          };
        }
        
        // Only include DELIVERED orders
        if (order.status === 'DELIVERED') {
          // Add current order to group
          acc[orderDate].orderCount += 1;
          acc[orderDate].sales += parseFloat(order.finalAmount || 0);
          
          // Count items sold from order items
          const itemCount = order.items ? order.items.reduce((sum, item) => 
            sum + (item.quantity || 0), 0) : 0;
          acc[orderDate].itemsSold += itemCount;
        }
        
        return acc;
      }, {});
      
      // Convert to array and calculate average order value
      const salesData = Object.values(salesByDate).map(day => ({
        ...day,
        avgOrderValue: day.orderCount > 0 ? day.sales / day.orderCount : 0
      }));
      
      setReportData(salesData);
    } else {
      // Create detailed sales data with individual items
      const detailedSalesData = [];
      
      orders.forEach(order => {
        if (order.status === 'DELIVERED' && order.items && order.items.length > 0) {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          
          // Verify that this date is within our filter range
          if (filters.startDate || filters.endDate) {
            if (!isDateInRange(orderDate, filters.startDate, filters.endDate)) {
              return; // Skip this order if outside date range
            }
          }
          
          order.items.forEach(item => {
            detailedSalesData.push({
              id: `${order.orderId}-${item.productName}`,
              date: orderDate,
              itemName: item.productName,
              quantity: item.quantity,
              price: item.priceAtPurchase,
              total: item.subtotal
            });
          });
        }
      });
      
      setReportData(detailedSalesData);
    }
  }, [orders, viewMode, filters.startDate, filters.endDate]);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle Apply Filters button click
  const handleApplyFilters = () => {
    setFiltersApplied(true); // Set flag to trigger fetch in useEffect
  };
  
  // Toggle between summary and detailed view
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'summary' ? 'detailed' : 'summary');
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
    if (!sortedData || sortedData.length === 0 || viewMode !== 'summary') return {};
    
    // Slice to get the last 30 days (most recent first)
    const slicedData = [...sortedData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    ).slice(0, 30).reverse();
    
    return {
      labels: slicedData.map(item => new Date(item.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Sales (Rs)',
          data: slicedData.map(item => item.sales),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Orders',
          data: slicedData.map(item => item.orderCount),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: true,
          yAxisID: 'y1'
        }
      ]
    };
  }, [sortedData, viewMode]);
  
  // Custom chart options to display both sales and orders properly
  const chartOptions = {
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Sales Amount (Rs)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false // only show grid for the left y-axis
        },
        title: {
          display: true,
          text: 'Orders'
        }
      }
    }
  };
  
  // Calculate summary metrics
  const getSummaryMetrics = () => {
    // Calculate from detailed data if in detailed view
    if (viewMode === 'detailed') {
      const totalSales = reportData.reduce((sum, item) => sum + Number(item.total), 0);
      const totalItems = reportData.reduce((sum, item) => sum + Number(item.quantity), 0);
      const uniqueOrders = new Set(reportData.map(item => item.id.split('-')[0])).size;
      
      return {
        totalSales: dashboardStats.totalSales > 0 ? 
          dashboardStats.totalSales.toFixed(2) : 
          totalSales.toFixed(2),
        totalOrders: uniqueOrders,
        totalItems,
        avgOrderValue: uniqueOrders ? (totalSales / uniqueOrders).toFixed(2) : '0.00'
      };
    }
    
    // Use dashboard stats for total sales to ensure consistency
    const calculatedTotalSales = reportData.reduce((sum, item) => sum + Number(item.sales), 0);
    const totalOrders = reportData.reduce((sum, item) => sum + Number(item.orderCount), 0);
    const totalItems = reportData.reduce((sum, item) => sum + Number(item.itemsSold), 0);
    const avgOrderValue = totalOrders ? calculatedTotalSales / totalOrders : 0;
    
    // If dashboard stats has a value, use it for totalSales
    return {
      totalSales: dashboardStats.totalSales > 0 ? 
        dashboardStats.totalSales.toFixed(2) : 
        calculatedTotalSales.toFixed(2),
      totalOrders,
      totalItems,
      avgOrderValue: avgOrderValue.toFixed(2)
    };
  };
  
  // Handle export to PDF
  const handleExportPdf = async () => {
    try {
      setLoading(true);
      
      // Create a PDF using jsPDF library
      const doc = new jsPDF();
      
      // Add title and date
      const title = 'Sales Report';
      const date = new Date().toLocaleDateString();
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${date}`, 14, 30);
      
      // Add filter information
      let yPos = 38;
      if (filters.startDate) {
        doc.text(`Start Date: ${filters.startDate}`, 14, yPos);
        yPos += 7;
      }
      if (filters.endDate) {
        doc.text(`End Date: ${filters.endDate}`, 14, yPos);
        yPos += 7;
      }
      
      // Add summary information
      const metrics = getSummaryMetrics();
      
      doc.setFontSize(14);
      doc.text('Sales Summary', 14, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.text(`Total Sales: Rs ${parseFloat(metrics.totalSales).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`, 14, yPos);
      yPos += 6;
      
      doc.text(`Total Orders: ${metrics.totalOrders}`, 14, yPos);
      yPos += 6;
      
      doc.text(`Items Sold: ${metrics.totalItems}`, 14, yPos);
      yPos += 6;
      
      doc.text(`Average Order Value: Rs ${parseFloat(metrics.avgOrderValue).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`, 14, yPos);
      yPos += 12;
      
      // Add daily sales summary table
      doc.setFontSize(14);
      doc.text('Daily Sales Summary', 14, yPos);
      yPos += 10;
      
      // Check if autoTable is available
      if (typeof doc.autoTable === 'function') {
        // Create table with autotable
        if (viewMode === 'summary') {
          doc.autoTable({
            startY: yPos,
            head: [['Date', 'Orders', 'Sales Amount (Rs)', 'Items Sold', 'Avg Order Value (Rs)']],
            body: sortedData.map(item => [
              new Date(item.date).toLocaleDateString(),
              item.orderCount,
              Number(item.sales).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }),
              item.itemsSold,
              Number(item.avgOrderValue).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            ]),
            theme: 'striped',
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            styles: {
              fontSize: 9,
              cellPadding: 3
            }
          });
        } else {
          // For detailed view
          doc.autoTable({
            startY: yPos,
            head: [['Date', 'Item Name', 'Quantity', 'Price (Rs)', 'Total (Rs)']],
            body: sortedData.map(item => [
              new Date(item.date).toLocaleDateString(),
              item.itemName,
              item.quantity,
              Number(item.price).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }),
              Number(item.total).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            ]),
            theme: 'striped',
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            },
            styles: {
              fontSize: 9,
              cellPadding: 3
            }
          });
        }
      } else {
        // Fallback to manual table drawing if autoTable is not available
        // Manual table header
        doc.setFillColor(41, 128, 185);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        
        if (viewMode === 'summary') {
          // Summary table
          const colWidths = [30, 20, 40, 30, 40];
          const headers = ['Date', 'Orders', 'Sales Amount (Rs)', 'Items Sold', 'Avg Order Value (Rs)'];
          
          // Draw header background
          doc.rect(14, yPos, 160, 8, 'F');
          
          // Draw header text
          let xPos = 16;
          headers.forEach((header, index) => {
            doc.text(header, xPos, yPos + 5);
            xPos += colWidths[index];
          });
          
          yPos += 8;
          
          // Reset text color for data rows
          doc.setTextColor(0, 0, 0);
          
          // Manually draw rows
          let rowCount = 0;
          for (const item of sortedData) {
            // Alternate row colors
            if (rowCount % 2 === 0) {
              doc.setFillColor(240, 240, 240);
              doc.rect(14, yPos, 160, 7, 'F');
            }
            
            xPos = 16;
            
            // Date
            doc.text(new Date(item.date).toLocaleDateString(), xPos, yPos + 5);
            xPos += colWidths[0];
            
            // Orders
            doc.text(String(item.orderCount), xPos, yPos + 5);
            xPos += colWidths[1];
            
            // Sales Amount
            doc.text(`Rs ${Number(item.sales).toFixed(2)}`, xPos, yPos + 5);
            xPos += colWidths[2];
            
            // Items Sold
            doc.text(String(item.itemsSold), xPos, yPos + 5);
            xPos += colWidths[3];
            
            // Avg Order Value
            doc.text(`Rs ${Number(item.avgOrderValue).toFixed(2)}`, xPos, yPos + 5);
            
            yPos += 7;
            rowCount++;
            
            // Add a new page if needed
            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
              rowCount = 0;
            }
          }
        } else {
          // Detailed view table
          const colWidths = [30, 60, 20, 25, 25];
          const headers = ['Date', 'Item Name', 'Quantity', 'Price (Rs)', 'Total (Rs)'];
          
          // Draw header background
          doc.rect(14, yPos, 160, 8, 'F');
          
          // Draw header text
          let xPos = 16;
          headers.forEach((header, index) => {
            doc.text(header, xPos, yPos + 5);
            xPos += colWidths[index];
          });
          
          yPos += 8;
          
          // Reset text color for data rows
          doc.setTextColor(0, 0, 0);
          
          // Manually draw rows
          let rowCount = 0;
          for (const item of sortedData) {
            // Alternate row colors
            if (rowCount % 2 === 0) {
              doc.setFillColor(240, 240, 240);
              doc.rect(14, yPos, 160, 7, 'F');
            }
            
            xPos = 16;
            
            // Date
            doc.text(new Date(item.date).toLocaleDateString(), xPos, yPos + 5);
            xPos += colWidths[0];
            
            // Item Name (truncate if too long)
            let itemName = item.itemName || 'N/A';
            if (itemName.length > 30) {
              itemName = itemName.substring(0, 27) + '...';
            }
            doc.text(itemName, xPos, yPos + 5);
            xPos += colWidths[1];
            
            // Quantity
            doc.text(String(item.quantity), xPos, yPos + 5);
            xPos += colWidths[2];
            
            // Price
            doc.text(`Rs ${Number(item.price).toFixed(2)}`, xPos, yPos + 5);
            xPos += colWidths[3];
            
            // Total
            doc.text(`Rs ${Number(item.total).toFixed(2)}`, xPos, yPos + 5);
            
            yPos += 7;
            rowCount++;
            
            // Add a new page if needed
            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
              rowCount = 0;
            }
          }
        }
      }
      
      // Save the PDF directly
      doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      alert('Failed to generate PDF report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle export to CSV
  const handleExportCsv = async () => {
    try {
      setLoading(true);
      
      // Properly escape CSV values to handle commas, quotes, etc.
      const escapeCSV = (value) => {
        value = String(value || '');
        // If the value contains commas, quotes, or newlines, wrap it in quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          // Double up any quotes within the value
          value = value.replace(/"/g, '""');
          // Wrap the value in quotes
          value = `"${value}"`;
        }
        return value;
      };
      
      let csvContent;
      
      if (viewMode === 'summary') {
        // Create summary CSV content
        const summaryHeaders = ['Date', 'Orders', 'Sales Amount (Rs)', 'Items Sold', 'Avg Order Value (Rs)'];
        const summaryRows = sortedData.map(item => [
          new Date(item.date).toLocaleDateString(),
          item.orderCount,
          Number(item.sales).toFixed(2),
          item.itemsSold,
          Number(item.avgOrderValue).toFixed(2)
        ]);
        
        csvContent = [
          ['SALES REPORT SUMMARY'],
          [`Generated on: ${new Date().toLocaleDateString()}`],
          [''],
          summaryHeaders.map(escapeCSV).join(','),
          ...summaryRows.map(row => row.map(escapeCSV).join(','))
        ].join('\n');
      } else {
        // Create detailed CSV content
        const detailedHeaders = ['Date', 'Item Name', 'Quantity', 'Price (Rs)', 'Total (Rs)'];
        const detailedRows = sortedData.map(item => [
          new Date(item.date).toLocaleDateString(),
          item.itemName,
          item.quantity,
          Number(item.price).toFixed(2),
          Number(item.total).toFixed(2)
        ]);
        
        csvContent = [
          ['SALES REPORT DETAILED ITEMS'],
          [`Generated on: ${new Date().toLocaleDateString()}`],
          [''],
          detailedHeaders.map(escapeCSV).join(','),
          ...detailedRows.map(row => row.map(escapeCSV).join(','))
        ].join('\n');
      }
      
      // Create blob and download it
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      alert('Failed to generate CSV report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const metrics = getSummaryMetrics();
  
  // Format total sales to match the dashboard format (with proper thousand separators)
  const formatTotalSales = (value) => {
    return `Rs ${parseFloat(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Sales Report (Delivered Orders)
      </h2>
      
      <ReportFilters
        reportType="sales"
        filters={filters}
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
              <DollarSign size={24} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Sales</p>
              <p className="text-2xl font-semibold">{formatTotalSales(metrics.totalSales)}</p>
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
              <p className="text-2xl font-semibold">Rs {metrics.avgOrderValue}</p>
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
      
      {/* Chart - only show in summary view */}
      {viewMode === 'summary' && (
        <div className="mb-6">
          <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Sales Trend
          </h3>
          <ReportChart 
            type="line"
            data={chartData}
            options={chartOptions}
            theme={theme}
            height={300}
          />
        </div>
      )}
      
      {/* View mode toggle */}
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {viewMode === 'summary' ? 'Sales Details' : 'Sales Items Detail'}
        </h3>
        
        <button
          onClick={toggleViewMode}
          className={`px-4 py-2 rounded-md text-sm ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          Switch to {viewMode === 'summary' ? 'Detailed' : 'Summary'} View
        </button>
      </div>
      
      {/* Table */}
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