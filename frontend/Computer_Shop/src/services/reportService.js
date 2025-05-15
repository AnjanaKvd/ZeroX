import api from './api';

/**
 * Fetches sales report data
 * @param {Object} params - Parameters for filtering the report
 * @param {string} params.startDate - Start date for filtering (YYYY-MM-DD)
 * @param {string} params.endDate - End date for filtering (YYYY-MM-DD)
 * @param {string} params.category - Filter by product category
 * @returns {Promise<Object>} - Report data
 */
export const getSalesReport = async (params = {}) => {
  try {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

/**
 * Fetches inventory report data
 * @param {Object} params - Parameters for filtering the report
 * @param {string} params.category - Filter by product category
 * @param {boolean} params.lowStock - Filter only low stock items
 * @returns {Promise<Object>} - Report data
 */
export const getInventoryReport = async (params = {}) => {
  try {
    const response = await api.get('/reports/inventory', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    throw error;
  }
};

/**
 * Fetches customer report data
 * @param {Object} params - Parameters for filtering the report
 * @param {string} params.startDate - Start date for filtering (YYYY-MM-DD)
 * @param {string} params.endDate - End date for filtering (YYYY-MM-DD)
 * @returns {Promise<Object>} - Report data
 */
export const getCustomerReport = async (params = {}) => {
  try {
    const response = await api.get('/reports/customers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer report:', error);
    throw error;
  }
};

/**
 * Exports a report to PDF format
 * @param {string} reportType - Type of report (sales, inventory, customers)
 * @param {Object} params - Parameters for filtering the report
 * @returns {Promise<Blob>} - PDF file blob
 */
export const exportReportToPdf = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/reports/${reportType}/export/pdf`, {
      params,
      responseType: 'blob' // Important: this tells axios to handle response as binary data
    });
    return response.data;
  } catch (error) {
    console.error(`Error exporting ${reportType} report to PDF:`, error);
    throw error;
  }
};

/**
 * Exports a report to CSV format
 * @param {string} reportType - Type of report (sales, inventory, customers)
 * @param {Object} params - Parameters for filtering the report
 * @returns {Promise<Blob>} - CSV file blob
 */
export const exportReportToCsv = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/reports/${reportType}/export/csv`, {
      params,
      responseType: 'blob' // Important: this tells axios to handle response as binary data
    });
    return response.data;
  } catch (error) {
    console.error(`Error exporting ${reportType} report to CSV:`, error);
    throw error;
  }
};

/**
 * Helper function to download blob as file
 * @param {Blob} blob - File blob
 * @param {string} fileName - Name for the downloaded file
 */
export const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
}; 