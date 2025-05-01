import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getOrderById, updateOrderStatus, cancelOrder } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);
  
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
      setNewStatus(data.status);
      setError(null);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return;
    
    setProcessing(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrder({...order, status: newStatus});
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    
    setProcessing(true);
    try {
      await cancelOrder(orderId);
      setOrder({...order, status: 'CANCELLED'});
      setNewStatus('CANCELLED');
      toast.success('Order has been cancelled');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setProcessing(false);
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error || 'Order not found'}
        </div>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link
            to="/admin/orders"
            className="text-blue-600 hover:underline mr-4"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>
        <span className={`${getStatusColor(order.status)} px-3 py-1 rounded-full text-sm font-medium`}>
          {order.status}
        </span>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Order Information</h2>
            <div className="border border-gray-200 rounded-md p-4">
              <div className="mb-2">
                <span className="text-gray-600">Order ID:</span>
                <span className="ml-2 font-medium">{order.orderId}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-medium">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-600">Customer Email:</span>
                <span className="ml-2 font-medium">{order.customerEmail}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-600">Payment Method:</span>
                <span className="ml-2 font-medium">{order.paymentMethod}</span>
              </div>
              {order.paymentId && (
                <div>
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="ml-2 font-medium">{order.paymentId}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Shipping Address */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
            <div className="border border-gray-200 rounded-md p-4">
              {order.shippingAddress ? (
                <>
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </>
              ) : (
                <p className="text-gray-500">No shipping address available</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <h2 className="text-lg font-semibold p-4 border-b">Order Items</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.productName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-500">{item.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-500">
                    ${(item.subtotal / item.quantity).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium">${item.subtotal.toFixed(2)}</div>
                </td>
              </tr>
            ))}
            
            {/* Total Row */}
            <tr className="bg-gray-50">
              <td colSpan="3" className="px-6 py-4 text-right font-medium">
                Total:
              </td>
              <td className="px-6 py-4 text-right">
                <div className="text-lg font-bold">${order.totalAmount.toFixed(2)}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Admin Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Update */}
          <div>
            <h3 className="text-md font-medium mb-2">Update Status</h3>
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={processing || order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                  className="w-full border rounded-md p-2"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={processing || newStatus === order.status || order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {processing ? 'Updating...' : 'Update'}
              </button>
            </div>
            {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
              <p className="text-sm text-gray-500 mt-2">
                {order.status === 'CANCELLED' ? 'Cancelled orders cannot be modified.' : 'Delivered orders cannot be modified.'}
              </p>
            )}
          </div>
          
          {/* Cancel Order */}
          <div>
            <h3 className="text-md font-medium mb-2">Cancel Order</h3>
            <button
              onClick={handleCancelOrder}
              disabled={processing || order.status === 'CANCELLED' || order.status === 'DELIVERED'}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
            >
              {order.status === 'CANCELLED' ? 'Order Cancelled' : (processing ? 'Processing...' : 'Cancel Order')}
            </button>
            {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
              <p className="text-sm text-gray-500 mt-2">
                {order.status === 'CANCELLED' ? 'This order has already been cancelled.' : 'Delivered orders cannot be cancelled.'}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminOrderDetails; 