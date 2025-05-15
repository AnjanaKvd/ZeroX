import api from './api';
import { jsPDF } from 'jspdf';

/**
 * Fetches sales report data
 * @param {Object} params - Parameters for filtering the report
 * @param {string} params.startDate - Start date for filtering (YYYY-MM-DD)
 * @param {string} params.endDate - End date for filtering (YYYY-MM-DD)
 * @param {string} params.category - Filter by product category
 * @returns {Promise<Object>} - Report data for delivered orders only
 */
export const getSalesReport = async (params = {}) => {
  try {
    // Add status=delivered to params to get only delivered orders
    const queryParams = { ...params, status: 'delivered' };
    const response = await api.get('/reports/sales', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

/**
 * Fetches order report data
 * @param {Object} params - Parameters for filtering the report
 * @param {string} params.startDate - Start date for filtering (YYYY-MM-DD)
 * @param {string} params.endDate - End date for filtering (YYYY-MM-DD)
 * @param {string} params.category - Filter by product category
 * @param {string} params.status - Filter by order status
 * @returns {Promise<Object>} - Report data
 */
export const getOrderReport = async (params = {}) => {
  try {
    const response = await api.get('/reports/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching order report:', error);
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
    console.log('Fetching inventory with params:', params);
    
    // Use the products API endpoint
    const apiParams = { 
      size: 1000, // Get a large number of products
    };
    
    // Add category filter if present
    if (params.category) {
      apiParams.categoryId = params.category;
    }
    
    const response = await api.get('/products', { params: apiParams });
    console.log('Products API response:', response.data);
    
    // Transform the product data into the format expected by the inventory report
    const inventoryItems = (response.data.content || []).map(product => {
      // Calculate stock status
      let status = 'In Stock';
      if (product.stockQuantity <= 0) {
        status = 'Out of Stock';
      } else if (product.stockQuantity <= product.lowStockThreshold) {
        status = 'Low Stock';
      }
      
      // Calculate stock value
      const stockValue = (product.stockQuantity || 0) * (product.price || 0);
      
      return {
        id: product.productId,
        sku: product.sku || 'N/A',
        name: product.name,
        category: product.categoryName || 'Uncategorized',
        stock: product.stockQuantity || 0,
        stockValue: stockValue,
        reorderLevel: product.lowStockThreshold || 5,
        status: status,
        price: product.price || 0,
        brand: product.brand || 'N/A'
      };
    });
    
    // If lowStock filter is applied, filter the results
    if (params.lowStock) {
      return inventoryItems.filter(item => 
        item.status === 'Low Stock' || item.status === 'Out of Stock'
      );
    }
    
    return inventoryItems;
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
    // Special handling for inventory report - generate PDF from product data
    if (reportType === 'inventory') {
      // Get the inventory data first
      const inventoryData = await getInventoryReport(params);
      
      // Create a PDF using jsPDF library
      const doc = new jsPDF();
      
      // Add title and date
      const title = 'Inventory Report';
      const date = new Date().toLocaleDateString();
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${date}`, 14, 30);
      
      // Add filter information if any
      let yPos = 38;
      if (params.category) {
        doc.text(`Category Filter: ${params.category}`, 14, yPos);
        yPos += 8;
      }
      if (params.lowStock) {
        doc.text('Showing Low Stock Items Only', 14, yPos);
        yPos += 8;
      }
      
      // Add summary information
      const totalProducts = inventoryData.length;
      const totalStockValue = inventoryData.reduce((sum, item) => sum + Number(item.stockValue || 0), 0);
      const lowStockCount = inventoryData.filter(item => item.status === 'Low Stock').length;
      const outOfStockCount = inventoryData.filter(item => item.status === 'Out of Stock').length;
      
      doc.setFontSize(12);
      doc.text('Summary', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.text(`Total Products: ${totalProducts}`, 14, yPos);
      yPos += 6;
      doc.text(`Total Stock Value: Rs ${totalStockValue.toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.text(`Low Stock Items: ${lowStockCount}`, 14, yPos);
      yPos += 6;
      doc.text(`Out of Stock Items: ${outOfStockCount}`, 14, yPos);
      yPos += 10;
      
      // Manual table header
      doc.setFillColor(41, 128, 185);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.rect(14, yPos, 180, 8, 'F');
      
      // Table header text
      doc.text('SKU', 16, yPos + 5);
      doc.text('Product Name', 36, yPos + 5);
      doc.text('Brand', 78, yPos + 5);
      doc.text('Category', 110, yPos + 5);
      doc.text('Price', 142, yPos + 5);
      doc.text('Stock', 160, yPos + 5);
      doc.text('Status', 178, yPos + 5);
      
      yPos += 8;
      
      // Reset text color for data rows
      doc.setTextColor(0, 0, 0);
      
      // Manually draw rows
      let rowCount = 0;
      for (const item of inventoryData) {
        // Alternate row colors
        if (rowCount % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(14, yPos, 180, 7, 'F');
        }
        
        doc.text(item.sku || 'N/A', 16, yPos + 5);
        
        // Truncate long product names
        let productName = item.name || 'N/A';
        if (productName.length > 20) {
          productName = productName.substring(0, 18) + '...';
        }
        doc.text(productName, 36, yPos + 5);
        
        doc.text(item.brand || 'N/A', 78, yPos + 5);
        doc.text(item.category || 'N/A', 110, yPos + 5);
        doc.text(`Rs ${Number(item.price || 0).toFixed(2)}`, 142, yPos + 5);
        doc.text(String(item.stock || 0), 160, yPos + 5);
        
        // Use red text color for low stock and out of stock items
        if (item.status === 'Low Stock') {
          doc.setTextColor(255, 0, 0); // Red
          doc.text(item.status, 178, yPos + 5);
          doc.setTextColor(0, 0, 0); // Reset to black
        } else if (item.status === 'Out of Stock') {
          doc.setTextColor(180, 0, 0); // Dark red
          doc.text(item.status, 178, yPos + 5);
          doc.setTextColor(0, 0, 0); // Reset to black
        } else {
          doc.text(item.status || 'N/A', 178, yPos + 5);
        }
        
        yPos += 7;
        rowCount++;
        
        // Add a new page if needed
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
          rowCount = 0;
        }
      }
      
      // Return as a blob
      return doc.output('blob');
    }
    
    // Default behavior for other report types
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
    // Special handling for inventory report - generate CSV from product data
    if (reportType === 'inventory') {
      // Get the inventory data first
      const inventoryData = await getInventoryReport(params);
      
      // Convert data to CSV
      const headers = ['SKU', 'Product Name', 'Brand', 'Category', 'Price', 'Stock Level', 'Stock Value', 'Reorder Level', 'Status'];
      const rows = inventoryData.map(item => [
        item.sku || 'N/A',
        item.name || 'N/A',
        item.brand || 'N/A',
        item.category || 'N/A',
        `Rs ${Number(item.price || 0).toFixed(2)}`,
        String(item.stock || 0),
        `Rs ${Number(item.stockValue || 0).toFixed(2)}`,
        String(item.reorderLevel || 0),
        item.status || 'N/A'
      ]);
      
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
      
      // Create CSV content
      const csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      return blob;
    }
    
    // Default behavior for other report types
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