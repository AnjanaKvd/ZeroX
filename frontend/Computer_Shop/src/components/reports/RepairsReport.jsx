import React, { useState, useEffect } from 'react';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import { exportReportToPdf, exportReportToCsv } from '../../services/reportService';

const RepairsReport = ({ theme }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'actualCompletionDate',
    direction: 'desc'
  });

  // Table columns for repairs report
  const columns = [
    { key: 'userFullName', label: 'Customer Name', sortable: true },
    { key: 'userEmail', label: 'Email', sortable: true },
    { key: 'deviceType', label: 'Device Type', sortable: true },
    { key: 'deviceModel', label: 'Device Model', sortable: true },
    { key: 'serialNumber', label: 'Serial Number', sortable: true },
    { key: 'problemDescription', label: 'Problem Description', sortable: false },
    { key: 'technicianName', label: 'Technician', sortable: true },
    { key: 'actualCompletionDate', label: 'Completion Date', sortable: true, isDate: true,
      format: (value) => value ? new Date(value).toISOString().slice(0, 10) : '' },
    { key: 'repairCost', label: 'Repair Cost', sortable: true,
      format: (value) => value != null ? `Rs ${parseFloat(value).toFixed(2)}` : '' },
    { key: 'isPaid', label: 'Paid', sortable: true,
      format: (value) => value ? 'Yes' : 'No' },
  ];

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
        const response = await fetch(`http://localhost:8080/api/report/repairs${query}`,
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
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle sorting
  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return { key: columnKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  // Apply frontend sorting
  const sortedData = React.useMemo(() => {
    if (!reportData) return [];
    const sorted = [...reportData];
    if (!sortConfig.key) return sorted;
    sorted.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (columns.find(col => col.key === sortConfig.key && col.isDate)) {
        aValue = aValue ? new Date(aValue) : 0;
        bValue = bValue ? new Date(bValue) : 0;
      }
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [reportData, sortConfig, columns]);

  // Export handlers
  const handleExportPdf = () => {
    exportReportToPdf({
      columns,
      data: sortedData,
      title: 'Repairs Report',
      fileName: 'repairs_report.pdf'
    });
  };

  const handleExportCsv = () => {
    exportReportToCsv({
      columns,
      data: sortedData,
      fileName: 'repairs_report.csv'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Repairs Report</h2>
        <div className="space-x-2">
          <button onClick={handleExportPdf} className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded border border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Export PDF
          </button>
          <button onClick={handleExportCsv} className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded border border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Export CSV
          </button>
        </div>
      </div>
      <ReportFilters filters={filters} onFilterChange={handleFilterChange} showCategory={false} />
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

export default RepairsReport;
