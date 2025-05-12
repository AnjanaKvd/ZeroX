import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders, cancelOrder } from '../services/orderService';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import PriceDisplay from '../components/common/PriceDisplay';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = { page, size: 10 };
        if (filter) {
          params.status = filter;
        }
        
        const data = await getUserOrders(user.userId, params);
        console.log("Orders data:", data);
        
        if (data.content) {
          setOrders(data.content);
          setTotalPages(data.totalPages);
        } else if (Array.isArray(data)) {
          setOrders(data);
          setTotalPages(Math.ceil(data.length / 10));
        } else {
          setOrders([]);
          setTotalPages(0);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Unable to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [page, filter, user]);
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(0); // Reset to first page when filter changes
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleCancelOrder = async (orderId) => {
    // Get the order to check its status
    const orderToCancel = orders.find(order => order.orderId === orderId);
    
    // Only allow cancellation of pending orders
    if (!orderToCancel || orderToCancel.status !== 'PENDING') {
      showToast('Only pending orders can be cancelled', 'error');
      return;
    }
    
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    setCancellingOrderId(orderId);
    try {
      await cancelOrder(orderId);
      
      // Update the order status in UI
      setOrders(orders.map(order => 
        order.orderId === orderId ? { ...order, status: 'CANCELLED' } : order
      ));
      
      showToast('Order cancelled successfully', 'success');
    } catch (err) {
      console.error('Error cancelling order:', err);
      showToast('Failed to cancel order. Please try again.', 'error');
    } finally {
      setCancellingOrderId(null);
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
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>
        
        <div className="mb-6 flex justify-between items-center">
          <div>
            <label htmlFor="statusFilter" className="mr-2 text-gray-700">Filter by status:</label>
            <select
              id="statusFilter"
              value={filter}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-6">You don't have any orders yet</p>
            <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Order ID</th>
                    <th className="text-center p-4">Date</th>
                    <th className="text-center p-4">Items</th>
                    <th className="text-center p-4">Total</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className="border-t border-gray-200">
                      <td className="p-4 font-medium">
                        <Link to={`/orders/${order.orderId}`} className="text-blue-600 hover:underline">
                          {order.orderId.substring(0, 8)}...
                        </Link>
                      </td>
                      <td className="text-center p-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-center p-4">{order.items.length}</td>
                      <td className="text-center p-4 font-medium">
                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                          <span>Order total:</span>
                          <span className="font-semibold"><PriceDisplay amount={order.totalAmount} /></span>
                        </div>
                        
                        {order.couponCode && (
                          <div className="flex justify-between text-sm text-green-600 mt-1">
                            <span>Coupon applied: {order.couponCode}</span>
                            <span className="font-semibold">-<PriceDisplay amount={order.discountAmount || 0} /></span>
                          </div>
                        )}
                      </td>
                      <td className="text-center p-4">
                        <span className={`${getStatusColor(order.status)} px-3 py-1 rounded-full text-xs`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-center p-4">
                        <div className="flex justify-center space-x-2">
                          <Link 
                            to={`/orders/${order.orderId}`}
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded text-sm"
                          >
                            Details
                          </Link>
                          
                          {order.status === 'PENDING' && (
                            <button
                              className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded text-sm"
                              disabled={cancellingOrderId === order.orderId}
                              onClick={() => handleCancelOrder(order.orderId)}
                            >
                              {cancellingOrderId === order.orderId ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                          
                          {order.status !== 'PENDING' && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                            <button
                              className="bg-gray-100 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed"
                              disabled={true}
                              title="Only pending orders can be cancelled"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 mr-2 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages - 1}
                  className="px-4 py-2 ml-2 bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default OrderHistory; 