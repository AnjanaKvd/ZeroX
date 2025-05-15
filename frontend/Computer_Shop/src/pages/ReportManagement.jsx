import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Users, Package, ShoppingBag } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getCategories } from '../services/categoryService';
import ReportCard from '../components/reports/ReportCard';
import SalesReport from '../components/reports/SalesReport';
import InventoryReport from '../components/reports/InventoryReport';
import CustomerReport from '../components/reports/CustomerReport';
import OrderReport from '../components/reports/OrderReport';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import { exportReportToPdf, exportReportToCsv, downloadBlob } from '../services/reportService';

const ReportManagement = () => {
  const { theme } = useTheme();
  const [activeReport, setActiveReport] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch categories for report filters
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategories();
        setCategories(response);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Some report filters may be limited.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Export functions for report cards
  const handleExportPdf = async (reportType) => {
    try {
      setLoading(true);
      const blob = await exportReportToPdf(reportType, {});
      downloadBlob(blob, `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error(`Failed to export ${reportType} report to PDF:`, error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportCsv = async (reportType) => {
    try {
      setLoading(true);
      const blob = await exportReportToCsv(reportType, {});
      downloadBlob(blob, `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error(`Failed to export ${reportType} report to CSV:`, error);
    } finally {
      setLoading(false);
    }
  };
  
  // Report definitions
  const reports = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Analyze sales performance, revenue trends, and order metrics over time',
      icon: 'chart',
      component: <SalesReport theme={theme} categories={categories} />
    },
    {
      id: 'orders',
      title: 'Order Detail Report',
      description: 'Generate detailed reports on orders with comprehensive order information',
      icon: 'file',
      component: <OrderReport theme={theme} />
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Monitor stock levels, identify low stock items, and track inventory value',
      icon: 'file',
      component: <InventoryReport theme={theme} categories={categories} />
    },
    {
      id: 'customers',
      title: 'Customer Report',
      description: 'Analyze customer demographics, spending patterns, and lifetime value',
      icon: 'chart',
      component: <CustomerReport theme={theme} categories={categories} />
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Report Management
      </h1>
      
      {loading && !activeReport && (
        <div className="flex justify-center my-12">
          <LoadingSpinner theme={theme} />
        </div>
      )}
      
      {error && (
        <div className={`mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 text-red-200' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}
      
      {activeReport ? (
        <div>
          <div className="mb-6">
            <button
              onClick={() => setActiveReport(null)}
              className={`px-4 py-2 rounded ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              ← Back to Reports
            </button>
          </div>
          
          {reports.find(r => r.id === activeReport)?.component}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              title={report.title}
              description={report.description}
              icon={report.icon}
              onView={() => setActiveReport(report.id)}
              onExportPdf={() => handleExportPdf(report.id)}
              onExportCsv={() => handleExportCsv(report.id)}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportManagement; 