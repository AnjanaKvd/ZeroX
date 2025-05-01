import React, { useState, useEffect } from 'react';
import { Eye, Package, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    page: 0,
    size: 10
  });
  const [totalPages, setTotalPages] = useState(0);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders(filters);
      setOrders(data.content);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      
      // Update the order in the UI
      setOrders(orders.map(order => 
        order.orderId === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilters({...filters, page: newPage});
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 0 }))}
              className="w-full border rounded-lg p-2"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderId.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={() => navigate(`/orders/${order.orderId}`)}
                      >
                        View
                      </button>
                      
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.orderId, 'PROCESSING')}
                          disabled={updatingOrderId === order.orderId}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Process
                        </button>
                      )}
                      
                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.orderId, 'SHIPPED')}
                          disabled={updatingOrderId === order.orderId}
                          className="text-purple-600 hover:text-purple-900 mr-4"
                        >
                          Ship
                        </button>
                      )}
                      
                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.orderId, 'DELIVERED')}
                          disabled={updatingOrderId === order.orderId}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 0}
                className="px-4 py-2 mr-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {filters.page + 1} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages - 1}
                className="px-4 py-2 ml-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderManagement; 