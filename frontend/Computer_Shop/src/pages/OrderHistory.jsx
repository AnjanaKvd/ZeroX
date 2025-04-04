import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../services/orderService';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = { page, size: 10 };
        if (filter) {
          params.status = filter;
        }
        
        const data = await getUserOrders(params);
        setOrders(data.content);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders', err);
        setError('Unable to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [page, filter]);
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(0); // Reset to first page when filter changes
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
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
      <Header />
      
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
                      <td className="text-center p-4">{order.itemCount}</td>
                      <td className="text-center p-4 font-medium">
                        ${order.totalAmount.toFixed(2)}
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
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                  // Handle cancel order logic
                                  console.log('Cancel order:', order.orderId);
                                }
                              }}
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
      
      <Footer />
    </div>
  );
};

export default OrderHistory; 