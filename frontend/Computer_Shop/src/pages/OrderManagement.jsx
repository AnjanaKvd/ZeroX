import React, { useState, useEffect } from 'react';
import { Eye, Package, Check, Trash, Edit, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAllOrders, updateOrderStatus, cancelOrder, getOrderById } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
// import Modal from '../components/common/Modal/Modal';

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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedOrderDetails, setExpandedOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrderId || !newStatus) return;
    
    setUpdatingOrderId(selectedOrderId);
    try {
      await updateOrderStatus(selectedOrderId, newStatus);
      
      // Update the order in the UI
      setOrders(orders.map(order => 
        order.orderId === selectedOrderId ? { ...order, status: newStatus } : order
      ));
      
      // Close modal and reset state
      setShowStatusModal(false);
      setSelectedOrderId(null);
      setNewStatus('');
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrderId) return;
    
    try {
      await cancelOrder(selectedOrderId);
      
      // Remove the order from UI
      setOrders(orders.filter(order => order.orderId !== selectedOrderId));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setSelectedOrderId(null);
      
      toast.success('Order has been cancelled');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to cancel order');
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

  const openStatusModal = (orderId, currentStatus) => {
    setSelectedOrderId(orderId);
    setNewStatus(currentStatus);
    setShowStatusModal(true);
  };

  const openDeleteModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDeleteModal(true);
  };

  const toggleOrderDetails = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setExpandedOrderDetails(null);
      return;
    }
    
    setExpandedOrderId(orderId);
    setLoadingDetails(true);
    
    try {
      const orderDetails = await getOrderById(orderId);
      setExpandedOrderDetails(orderDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoadingDetails(false);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input 
              type="text" 
              placeholder="Order ID or Customer Email"
              className="w-full border rounded-lg p-2"
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 0 }))}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => fetchOrders()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh
            </button>
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
                  <React.Fragment key={order.orderId}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleOrderDetails(order.orderId)}
                            className="mr-2 focus:outline-none"
                          >
                            {expandedOrderId === order.orderId ? 
                              <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            }
                          </button>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderId.substring(0, 8)}...
                          </div>
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
                        <div className="flex items-center space-x-3">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => openStatusModal(order.orderId, order.status)}
                            title="Update Status"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          
                          {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => openDeleteModal(order.orderId)}
                              title="Cancel Order"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Order Details */}
                    {expandedOrderId === order.orderId && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 bg-gray-50">
                          {loadingDetails ? (
                            <div className="text-center py-4">
                              <LoadingSpinner size="small" />
                            </div>
                          ) : expandedOrderDetails ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-sm font-semibold mb-2">Order Items</h3>
                                <table className="min-w-full divide-y divide-gray-200 border">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expandedOrderDetails.items.map((item, index) => (
                                      <tr key={index} className="border-t">
                                        <td className="px-3 py-2 text-xs">{item.productName}</td>
                                        <td className="px-3 py-2 text-xs text-center">{item.quantity}</td>
                                        <td className="px-3 py-2 text-xs text-right">${item.subtotal.toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-semibold mb-2">Shipping Address</h3>
                                <div className="border p-3 text-xs">
                                  {expandedOrderDetails.shippingAddress ? (
                                    <>
                                      <p><span className="font-semibold">Name:</span> {expandedOrderDetails.shippingAddress.fullName}</p>
                                      <p><span className="font-semibold">Address:</span> {expandedOrderDetails.shippingAddress.addressLine1}</p>
                                      {expandedOrderDetails.shippingAddress.addressLine2 && <p>{expandedOrderDetails.shippingAddress.addressLine2}</p>}
                                      <p>{expandedOrderDetails.shippingAddress.city}, {expandedOrderDetails.shippingAddress.state} {expandedOrderDetails.shippingAddress.zipCode}</p>
                                      <p>{expandedOrderDetails.shippingAddress.country}</p>
                                    </>
                                  ) : (
                                    <p>No address information available</p>
                                  )}
                                </div>
                                
                                <h3 className="text-sm font-semibold mt-4 mb-2">Payment Information</h3>
                                <div className="border p-3 text-xs">
                                  <p><span className="font-semibold">Method:</span> {expandedOrderDetails.paymentMethod}</p>
                                  {expandedOrderDetails.paymentId && (
                                    <p><span className="font-semibold">Payment ID:</span> {expandedOrderDetails.paymentId}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-center text-gray-500">Failed to load order details</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
      
      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrderStatus}
                disabled={updatingOrderId === selectedOrderId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {updatingOrderId === selectedOrderId ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Cancel Order</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleDeleteOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default OrderManagement; 