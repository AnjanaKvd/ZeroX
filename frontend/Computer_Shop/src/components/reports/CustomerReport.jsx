import React, { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import { exportReportToPdf, exportReportToCsv, downloadBlob } from '../../services/reportService';

const CustomerReport = ({ theme }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // Prepare table columns for customer report (matching API fields)
  const columns = [
    { key: 'fullName', label: 'Customer Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'createdAt', label: 'Join Date', sortable: true, isDate: true,
      format: (value) => value ? new Date(value).toISOString().slice(0, 10) : '' },
    { key: 'loyaltyPoints', label: 'Loyalty Points', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'lastLogin', label: 'Last Login', sortable: true,
      format: (value) => value ? new Date(value).toLocaleDateString() : 'Never' }
  ];

  // Fetch customer report from new API
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        // Build query params for date filters
        const params = [];
        if (filters.startDate) params.push(`startDate=${filters.startDate}`);
        if (filters.endDate) params.push(`endDate=${filters.endDate}`);
        const query = params.length > 0 ? `?${params.join('&')}` : '';
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/report/customers${query}`,
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
          setReportData([]);
        }
      } catch (error) {
        setReportData([]);
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

  // Handle Apply Filters button (from ReportFilters)
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Apply sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort data based on filters and sortConfig
  const filteredAndSortedData = React.useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    let filtered = [...reportData];
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(row => {
        if (!row.createdAt) return false;
        const created = new Date(row.createdAt);
        return created >= start;
      });
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filtered = filtered.filter(row => {
        if (!row.createdAt) return false;
        const created = new Date(row.createdAt);
        return created <= end;
      });
    }
    // Now sort
    const { key, direction } = sortConfig;
    return filtered.sort((a, b) => {
      if (key === 'createdAt' || key === 'lastLogin') {
        const parseDate = (val) => {
          if (!val) return 0;
          const t = Date.parse(val);
          return isNaN(t) ? 0 : t;
        };
        const dateA = parseDate(a[key]);
        const dateB = parseDate(b[key]);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [reportData, filters, sortConfig]);

  // Calculate summary metrics
  const getSummaryMetrics = () => {
    if (!reportData || reportData.length === 0) return {
      totalCustomers: 0,
      newCustomers: 0
    };
    const totalCustomers = reportData.length;
    // Count customers joined in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = reportData.filter(customer => {
      const joinDate = new Date(customer.createdAt);
      return joinDate >= thirtyDaysAgo;
    }).length;
    return {
      totalCustomers,
      newCustomers
    };
  };

  const metrics = getSummaryMetrics();

  // Export PDF and CSV for filtered and sorted data
  const handleExportPdf = async () => {
    const blob = await exportReportToPdf('customers', {
      data: filteredAndSortedData,
      columns,
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    downloadBlob(blob, 'Customer_Report.pdf');
  };
  const handleExportCsv = async () => {
    const blob = await exportReportToCsv('customers', {
      data: filteredAndSortedData,
      columns,
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    downloadBlob(blob, 'Customer_Report.csv');
  };

  return (
    <div>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Customer Report
      </h2>
      <ReportFilters
        reportType="customers"
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        theme={theme}
        // Category dropdown removed
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
      </div>
      {/* Table */}
      <h3 className={`text-lg font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Customer Details
      </h3>
      <ReportTable
        data={filteredAndSortedData}
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