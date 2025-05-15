import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShoppingCart, CreditCard } from 'lucide-react';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import ReportChart from './ReportChart';
import { getCustomerReport, exportReportToPdf, exportReportToCsv, downloadBlob } from '../../services/reportService';

const CustomerReport = ({ theme, categories = [] }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'totalSpent',
    direction: 'desc'
  });
  
  // Prepare table columns for customer report
  const columns = [
    { key: 'id', label: 'Customer ID', sortable: true },
    { key: 'name', label: 'Customer Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'joinDate', label: 'Join Date', sortable: true,
      format: (value) => new Date(value).toLocaleDateString() },
    { key: 'totalOrders', label: 'Total Orders', sortable: true },
    { key: 'totalSpent', label: 'Total Spent', sortable: true,
      format: (value) => `$${parseFloat(value).toFixed(2)}` },
    { key: 'avgOrderValue', label: 'Avg Order Value', sortable: true,
      format: (value) => `$${parseFloat(value).toFixed(2)}` },
    { key: 'lastOrderDate', label: 'Last Order', sortable: true,
      format: (value) => value ? new Date(value).toLocaleDateString() : 'Never' }
  ];
  
  // Load report data when filters change
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await getCustomerReport(filters);
        setReportData(response);
      } catch (error) {
        console.error('Failed to fetch customer report:', error);
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
  
  // Chart data for spending distribution
  const spendingChartData = React.useMemo(() => {
    if (!sortedData || sortedData.length === 0) return {};
    
    // Define spending brackets
    const brackets = [
      { min: 0, max: 100, label: '$0-$100' },
      { min: 100, max: 500, label: '$100-$500' },
      { min: 500, max: 1000, label: '$500-$1000' },
      { min: 1000, max: 2500, label: '$1000-$2500' },
      { min: 2500, max: 5000, label: '$2500-$5000' },
      { min: 5000, max: Infinity, label: '$5000+' }
    ];
    
    // Count customers in each spending bracket
    const bracketCounts = brackets.map(bracket => {
      return {
        label: bracket.label,
        count: sortedData.filter(customer => 
          customer.totalSpent >= bracket.min && 
          customer.totalSpent < bracket.max
        ).length
      };
    });
    
    return {
      labels: bracketCounts.map(b => b.label),
      datasets: [
        {
          label: 'Number of Customers',
          data: bracketCounts.map(b => b.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.6)', // blue
            'rgba(16, 185, 129, 0.6)', // green
            'rgba(245, 158, 11, 0.6)', // amber
            'rgba(139, 92, 246, 0.6)', // purple
            'rgba(236, 72, 153, 0.6)', // pink
            'rgba(239, 68, 68, 0.6)'   // red
          ],
          borderColor: [
            '#3b82f6', // blue
            '#10b981', // green
            '#f59e0b', // amber
            '#8b5cf6', // purple
            '#ec4899', // pink
            '#ef4444'  // red
          ],
          borderWidth: 1
        }
      ]
    };
  }, [sortedData]);
  
  // Chart data for new customers over time
  const newCustomersChartData = React.useMemo(() => {
    if (!sortedData || sortedData.length === 0) return {};
    
    // Get date range from filters or use last 12 months
    let startDate, endDate;
    if (filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
    } else {
      endDate = new Date();
      startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 11); // Last 12 months
    }
    
    // Create array of months between start and end dates
    const months = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Count new customers for each month
    const monthlyCounts = months.map(month => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      return {
        month: `${month.toLocaleString('default', { month: 'short' })} ${month.getFullYear()}`,
        count: sortedData.filter(customer => {
          const joinDate = new Date(customer.joinDate);
          return joinDate >= monthStart && joinDate <= monthEnd;
        }).length
      };
    });
    
    return {
      labels: monthlyCounts.map(m => m.month),
      datasets: [
        {
          label: 'New Customers',
          data: monthlyCounts.map(m => m.count),
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          tension: 0.3,
          fill: true
        }
      ]
    };
  }, [sortedData, filters.startDate, filters.endDate]);
  
  // Calculate summary metrics
  const getSummaryMetrics = () => {
    if (!reportData || reportData.length === 0) return {
      totalCustomers: 0,
      totalRevenue: 0,
      avgLifetimeValue: 0,
      newCustomers: 0
    };
    
    const totalCustomers = reportData.length;
    const totalRevenue = reportData.reduce((sum, customer) => sum + Number(customer.totalSpent || 0), 0);
    const avgLifetimeValue = totalCustomers ? totalRevenue / totalCustomers : 0;
    
    // Count customers joined in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newCustomers = reportData.filter(customer => {
      const joinDate = new Date(customer.joinDate);
      return joinDate >= thirtyDaysAgo;
    }).length;
    
    return {
      totalCustomers,
      totalRevenue: totalRevenue.toFixed(2),
      avgLifetimeValue: avgLifetimeValue.toFixed(2),
      newCustomers
    };
  };
  
  // Handle export to PDF
  const handleExportPdf = async () => {
    try {
      setLoading(true);
      const blob = await exportReportToPdf('customers', filters);
      downloadBlob(blob, `customer-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
      const blob = await exportReportToCsv('customers', filters);
      downloadBlob(blob, `customer-report-${new Date().toISOString().split('T')[0]}.csv`);
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
        Customer Report
      </h2>
      
      <ReportFilters
        reportType="customers"
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
              <Users size={24} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Customers</p>
              <p className="text-2xl font-semibold">{metrics.totalCustomers}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} mr-4`}>
              <UserPlus size={24} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>New Customers (30d)</p>
              <p className="text-2xl font-semibold">{metrics.newCustomers}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'} mr-4`}>
              <CreditCard size={24} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Revenue</p>
              <p className="text-2xl font-semibold">${metrics.totalRevenue}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-900' : 'bg-indigo-100'} mr-4`}>
              <ShoppingCart size={24} className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Avg Lifetime Value</p>
              <p className="text-2xl font-semibold">${metrics.avgLifetimeValue}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            New Customers Over Time
          </h3>
          <ReportChart 
            type="line"
            data={newCustomersChartData}
            theme={theme}
            height={300}
          />
        </div>
        
        <div>
          <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Customer Spending Distribution
          </h3>
          <ReportChart 
            type="doughnut"
            data={spendingChartData}
            theme={theme}
            height={300}
            options={{
              plugins: {
                legend: {
                  position: 'right'
                }
              }
            }}
          />
        </div>
      </div>
      
      {/* Table */}
      <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Customer Details
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

export default CustomerReport; 