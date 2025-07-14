import React, { useState, useEffect } from 'react';
import { getAllOrders } from '../../services/orderService';
import { PieChart, ShoppingCart, AlertCircle } from 'lucide-react';

// Import the ReportChart component for visualization
import ReportChart from '../reports/ReportChart';

const OrderStatusChart = ({ theme }) => {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch order data on component mount
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        
        // Fetch all orders
        const ordersData = await getAllOrders({ size: 100 }); // Get a larger sample
        
        if (ordersData && ordersData.content && Array.isArray(ordersData.content)) {
          // Process order data to count by status
          processOrderData(ordersData.content);
        } else {
          setError('No order data available');
        }
      } catch (error) {
        setError('Failed to load order data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderData();
  }, []);
  
  // Process order data to count by status
  const processOrderData = (orders) => {
    // Count orders by status
    const statusCounts = {};
    
    orders.forEach(order => {
      const status = order.status || 'UNKNOWN';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Calculate delivered and canceled counts specifically
    const deliveredCount = statusCounts['DELIVERED'] || 0;
    const canceledCount = statusCounts['CANCELLED'] || 0;
    
    // Calculate other statuses combined
    const otherStatuses = Object.keys(statusCounts)
      .filter(status => status !== 'DELIVERED' && status !== 'CANCELLED')
      .reduce((sum, status) => sum + statusCounts[status], 0);
    
    // Calculate total for ratio
    const total = deliveredCount + canceledCount + otherStatuses;
    
    // Prepare chart data
    const chartData = {
      labels: ['Delivered', 'Cancelled', 'Other Statuses'],
      datasets: [
        {
          label: 'Order Status Distribution',
          data: [deliveredCount, canceledCount, otherStatuses],
          backgroundColor: [
            'rgba(34, 197, 94, 0.6)',  // green for delivered
            'rgba(239, 68, 68, 0.6)',  // red for canceled
            'rgba(148, 163, 184, 0.6)'  // gray for others
          ],
          borderWidth: 1
        }
      ]
    };
    
    // Calculate the ratio of delivered to canceled orders
    let ratio = 'N/A';
    if (canceledCount > 0) {
      ratio = (deliveredCount / canceledCount).toFixed(2);
    } else if (deliveredCount > 0) {
      ratio = '∞'; // Infinity symbol when no canceled orders
    }
    
    setOrderData({
      chartData,
      metrics: {
        deliveredCount,
        canceledCount,
        otherStatuses,
        total,
        ratio
      }
    });
  };

  // Chart options
  const chartOptions = {
    plugins: {
      legend: {
        position: 'right'
      },
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
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm mb-6`}>
      <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Order Status Distribution
      </h3>
      
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`}></div>
        </div>
      ) : error ? (
        <div className={`flex items-center justify-center h-48 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
          <AlertCircle className="mr-2" size={20} />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-green-900' : 'bg-green-200'} mr-3`}>
                  <ShoppingCart size={16} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Delivered Orders</p>
                  <p className="text-lg font-semibold">{orderData?.metrics.deliveredCount || 0}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-red-900' : 'bg-red-200'} mr-3`}>
                  <AlertCircle size={16} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Cancelled Orders</p>
                  <p className="text-lg font-semibold">{orderData?.metrics.canceledCount || 0}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-200'} mr-3`}>
                  <PieChart size={16} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Delivered:Cancelled Ratio</p>
                  <p className="text-lg font-semibold">{orderData?.metrics.ratio}</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-200'} mr-3`}>
                  <ShoppingCart size={16} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Total Orders</p>
                  <p className="text-lg font-semibold">{orderData?.metrics.total || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pie Chart */}
          <ReportChart 
            type="pie"
            data={orderData?.chartData}
            theme={theme}
            height={300}
            options={chartOptions}
          />
        </>
      )}
    </div>
  );
};

export default OrderStatusChart; 