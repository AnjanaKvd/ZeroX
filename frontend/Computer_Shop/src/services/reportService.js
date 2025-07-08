import api from './api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    const queryParams = { 
      ...params, 
      status: 'delivered',
      // Convert category to categoryId if present
      ...(params.category && { categoryId: params.category })
    };
    
    console.log('Fetching sales report with params:', queryParams);
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
    console.log('Fetching order report with params:', params);
    
    // Use the orders API endpoint instead of reports/orders
    const apiParams = { 
      size: 100, // Get a large number of orders
      ...params
    };
    
    // Convert status to uppercase if present (API expects uppercase)
    if (params.status) {
      apiParams.status = params.status.toUpperCase();
    }
    
    const response = await api.get('/orders', { params: apiParams });
    const orders = response.data.content || [];
    
    // Transform the order data into the format expected by the order report
    return orders.map(order => {
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
        customerName: order.customerName || 'Unknown',
        customerEmail: order.customerEmail || '',
        customerPhone: order.customerPhone || '',
        totalAmount: order.finalAmount || order.totalAmount || 0,
        itemCount: itemCount,
        status: order.status || 'Pending',
        deliveryDate: deliveryDate,
        items: order.items || [],
        shippingAddress: order.shippingAddress || null
      };
    });
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
 * Fetches sales data directly from the orders API
 * @param {Object} params - Parameters for filtering orders
 * @returns {Promise<Object>} - Processed sales data
 */
export const fetchSalesDataFromOrders = async (params = {}) => {
  try {
    // Prepare query parameters for orders API
    const queryParams = { 
      status: 'DELIVERED', // Only fetch delivered orders
      size: 100, // Get more orders at once
      ...params
    };
    
    // Fetch orders from API
    const response = await api.get('/orders', { params: queryParams });
    const orders = response.data.content || [];
    
    // Process orders into different sales data formats
    const summaryData = processSalesDataSummary(orders, params);
    const detailedData = processSalesDataDetailed(orders, params);
    
    return {
      summary: summaryData,
      detailed: detailedData,
      rawOrders: orders
    };
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
};

/**
 * Process orders into summary sales data
 */
const processSalesDataSummary = (orders, filters) => {
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
  
  // Group orders by date
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
  
  // Sort by date descending
  return salesData.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Process orders into detailed sales data
 */
const processSalesDataDetailed = (orders, filters) => {
  const detailedSalesData = [];
  
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
          orderId: order.orderId,
          orderReference: order.orderReference || order.orderId,
          itemName: item.productName,
          quantity: item.quantity,
          price: item.priceAtPurchase,
          total: item.subtotal
        });
      });
    }
  });
  
  // Sort by date descending
  return detailedSalesData.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Exports a report to PDF format
 * @param {string} reportType - Type of report (sales, inventory, customers)
 * @param {Object} params - Parameters for filtering the report
 * @returns {Promise<Blob>} - PDF file blob
 */
export const exportReportToPdf = async (reportType, params = {}) => {
  try {
    console.log(`Exporting ${reportType} report to PDF with params:`, params);
    
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
    
    // Special handling for sales report
    if (reportType === 'sales') {
      console.log('Generating sales PDF report...');
      
      // Fetch sales data from orders
      const salesData = await fetchSalesDataFromOrders(params);
      console.log('Sales data fetched for PDF:', salesData);
      
      // Create a PDF using jsPDF library with autotable plugin
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
      if (params.startDate) {
        doc.text(`Start Date: ${params.startDate}`, 14, yPos);
        yPos += 7;
      }
      if (params.endDate) {
        doc.text(`End Date: ${params.endDate}`, 14, yPos);
        yPos += 7;
      }
      
      // Add summary information
      const summaryData = salesData.summary;
      const totalSales = summaryData.reduce((sum, item) => sum + Number(item.sales || 0), 0);
      const totalOrders = summaryData.reduce((sum, item) => sum + Number(item.orderCount || 0), 0);
      const totalItems = summaryData.reduce((sum, item) => sum + Number(item.itemsSold || 0), 0);
      const avgOrderValue = totalOrders ? totalSales / totalOrders : 0;
      
      doc.setFontSize(14);
      doc.text('Sales Summary', 14, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.text(`Total Sales: Rs ${totalSales.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`, 14, yPos);
      yPos += 6;
      
      doc.text(`Total Orders: ${totalOrders}`, 14, yPos);
      yPos += 6;
      
      doc.text(`Items Sold: ${totalItems}`, 14, yPos);
      yPos += 6;
      
      doc.text(`Average Order Value: Rs ${avgOrderValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`, 14, yPos);
      yPos += 12;
      
      // Add daily sales summary table
      doc.setFontSize(14);
      doc.text('Daily Sales Summary', 14, yPos);
      yPos += 10;
      
      // Create summary table
      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Orders', 'Sales Amount (Rs)', 'Items Sold', 'Avg Order Value (Rs)']],
        body: summaryData.map(item => [
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
      
      // Add a new page for detailed sales
      doc.addPage();
      
      // Add title and date for detailed page
      doc.setFontSize(16);
      doc.text('Sales Report - Detailed Items', 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${date}`, 14, 30);
      yPos = 40;
      
      // Create detailed items table
      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Order ID', 'Item Name', 'Quantity', 'Price (Rs)', 'Total (Rs)']],
        body: salesData.detailed.map(item => [
          new Date(item.date).toLocaleDateString(),
          item.orderReference || item.orderId,
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
      
      console.log('PDF generation completed');
      
      // Return as a blob
      return doc.output('blob');
    }
    
    // Special handling for order reports
    if (reportType === 'orders') {
      console.log('Generating order PDF report...');
      
      // Fetch order data
      const orderData = await getOrderReport(params);
      console.log('Order data fetched for PDF:', orderData);
      
      // Create a PDF using jsPDF library with autotable plugin
      const doc = new jsPDF();
      
      // Add title and date
      const title = 'Order Report';
      const date = new Date().toLocaleDateString();
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${date}`, 14, 30);
      
      // Add filter information
      let yPos = 38;
      if (params.startDate) {
        doc.text(`Start Date: ${params.startDate}`, 14, yPos);
        yPos += 7;
      }
      if (params.endDate) {
        doc.text(`End Date: ${params.endDate}`, 14, yPos);
        yPos += 7;
      }
      if (params.status) {
        doc.text(`Status: ${params.status}`, 14, yPos);
        yPos += 7;
      }
      
      // Add summary information
      const totalOrders = orderData.length;
      const totalAmount = orderData.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
      const avgOrderValue = totalOrders ? totalAmount / totalOrders : 0;
      
      // Count orders by status
      const statusCounts = {};
      orderData.forEach(order => {
        const status = order.status || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      doc.setFontSize(14);
      doc.text('Order Summary', 14, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.text(`Total Orders: ${totalOrders}`, 14, yPos);
      yPos += 6;
      
      doc.text(`Total Amount: Rs ${totalAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`, 14, yPos);
      yPos += 6;
      
      doc.text(`Average Order Value: Rs ${avgOrderValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`, 14, yPos);
      yPos += 6;
      
      // Add status breakdown
      doc.text('Status Breakdown:', 14, yPos);
      yPos += 6;
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        doc.text(`${status}: ${count} orders`, 24, yPos);
        yPos += 5;
      });
      
      yPos += 6;
      
      // Create order table
      doc.autoTable({
        startY: yPos,
        head: [['Order ID', 'Date', 'Customer', 'Items', 'Amount (Rs)', 'Status']],
        body: orderData.map(order => [
          order.orderId,
          new Date(order.orderDate).toLocaleDateString(),
          order.customerName,
          order.itemCount,
          Number(order.totalAmount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }),
          order.status
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
      
      console.log('PDF generation completed');
      
      // Return as a blob
      return doc.output('blob');
    }
    
    // If we get here, the report type isn't supported
    console.error(`PDF export not implemented for report type: ${reportType}`);
    throw new Error(`PDF export not implemented for report type: ${reportType}`);
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
    console.log(`Exporting ${reportType} report to CSV with params:`, params);
    
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
    
    // Special handling for sales report
    if (reportType === 'sales') {
      console.log('Generating sales CSV report...');
      
      // Fetch sales data from orders
      const salesData = await fetchSalesDataFromOrders(params);
      console.log('Sales data fetched for CSV:', salesData);
      
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
      
      // Create summary CSV content
      const summaryHeaders = ['Date', 'Orders', 'Sales Amount (Rs)', 'Items Sold', 'Avg Order Value (Rs)'];
      const summaryRows = salesData.summary.map(item => [
        new Date(item.date).toLocaleDateString(),
        item.orderCount,
        Number(item.sales).toFixed(2),
        item.itemsSold,
        Number(item.avgOrderValue).toFixed(2)
      ]);
      
      const summaryCsv = [
        ['SALES REPORT SUMMARY'],
        [`Generated on: ${new Date().toLocaleDateString()}`],
        [''],
        summaryHeaders.map(escapeCSV).join(','),
        ...summaryRows.map(row => row.map(escapeCSV).join(','))
      ].join('\n');
      
      // Create detailed CSV content
      const detailedHeaders = ['Date', 'Order ID', 'Item Name', 'Quantity', 'Price (Rs)', 'Total (Rs)'];
      const detailedRows = salesData.detailed.map(item => [
        new Date(item.date).toLocaleDateString(),
        item.orderReference || item.orderId,
        item.itemName,
        item.quantity,
        Number(item.price).toFixed(2),
        Number(item.total).toFixed(2)
      ]);
      
      const detailedCsv = [
        [''],
        [''],
        ['DETAILED SALES ITEMS'],
        detailedHeaders.map(escapeCSV).join(','),
        ...detailedRows.map(row => row.map(escapeCSV).join(','))
      ].join('\n');
      
      // Combine both reports
      const fullCsvContent = summaryCsv + '\n' + detailedCsv;
      
      console.log('CSV generation completed');
      
      const blob = new Blob([fullCsvContent], { type: 'text/csv;charset=utf-8;' });
      return blob;
    }
    
    // Special handling for order reports
    if (reportType === 'orders') {
      console.log('Generating order CSV report...');
      
      // Fetch order data
      const orderData = await getOrderReport(params);
      console.log('Order data fetched for CSV:', orderData);
      
      // Define headers
      const headers = ['Order ID', 'Date', 'Customer', 'Items', 'Amount (Rs)', 'Status'];
      
      // Create rows
      const rows = orderData.map(order => [
        order.orderId,
        new Date(order.orderDate).toLocaleDateString(),
        order.customerName,
        order.itemCount,
        Number(order.totalAmount).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        order.status
      ]);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      // Add rows to CSV content
      rows.forEach(row => {
        const escapedRow = row.map(value => {
          // Escape commas and quotes
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;  // Escape quotes by doubling them
          }
          return stringValue;
        });
        csvContent += escapedRow.join(',') + '\n';
      });
      
      // Add summary section
      csvContent += '\n"Order Summary"\n';
      
      // Calculate summary data
      const totalOrders = orderData.length;
      const totalAmount = orderData.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
      const avgOrderValue = totalOrders ? totalAmount / totalOrders : 0;
      
      // Add summary rows
      csvContent += `"Total Orders",${totalOrders}\n`;
      csvContent += `"Total Amount","Rs ${totalAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}"\n`;
      csvContent += `"Average Order Value","Rs ${avgOrderValue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}"\n`;
      
      // Add status breakdown
      csvContent += '\n"Status Breakdown"\n';
      
      // Count orders by status
      const statusCounts = {};
      orderData.forEach(order => {
        const status = order.status || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        csvContent += `"${status}",${count}\n`;
      });
      
      console.log('CSV generation completed');
      
      // Create and return blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      return blob;
    }
    
    // If we get here, the report type isn't supported
    console.error(`CSV export not implemented for report type: ${reportType}`);
    throw new Error(`CSV export not implemented for report type: ${reportType}`);
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
  try {
    console.log(`Downloading blob as file: ${fileName}`);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log('Download completed');
  } catch (error) {
    console.error('Error downloading blob as file:', error);
    throw error;
  }
};