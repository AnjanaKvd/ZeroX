import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../services/orderService';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details', err);
        setError('Unable to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    setCancelling(true);
    try {
      const updatedOrder = await cancelOrder(orderId);
      setOrder(updatedOrder);
    } catch (err) {
      console.error('Error cancelling order', err);
      setError('Failed to cancel order. Please try again later.');
    } finally {
      setCancelling(false);
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
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Order not found'}
          </div>
          <div className="mt-6 text-center">
            <Link to="/orders" className="text-blue-600 hover:underline">
              ← Back to Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/orders" className="text-blue-600 hover:underline">
            ← Back to Orders
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
            <span className={`${getStatusColor(order.status)} px-4 py-1 rounded-full text-sm font-medium`}>
              {order.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="ml-2 font-medium">{order.paymentMethod.replace('_', ' ')}</span>
                </div>
                {order.paymentId && (
                  <div>
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="ml-2 font-medium">{order.paymentId}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
              <div className="border border-gray-200 rounded-md p-4">
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold mb-3">Order Items</h2>
          <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-center p-4">Price</th>
                  <th className="text-center p-4">Quantity</th>
                  <th className="text-right p-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded flex items-center justify-center mr-3">
                          <span className="text-gray-500 text-xs">Image</span>
                        </div>
                        <span>{item.productName}</span>
                      </div>
                    </td>
                    <td className="text-center p-4">${item.unitPrice.toFixed(2)}</td>
                    <td className="text-center p-4">{item.quantity}</td>
                    <td className="text-right p-4 font-medium">${item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr className="border-t border-gray-200">
                  <td colSpan="3" className="text-right p-4 font-medium">Subtotal</td>
                  <td className="text-right p-4 font-medium">${order.totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-right p-4 font-medium">Shipping</td>
                  <td className="text-right p-4 font-medium">$0.00</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-right p-4 font-medium">Tax</td>
                  <td className="text-right p-4 font-medium">$0.00</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td colSpan="3" className="text-right p-4 font-bold">Total</td>
                  <td className="text-right p-4 font-bold">${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {order.status === 'PENDING' && (
            <div className="text-center">
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-md disabled:opacity-70"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderDetails; 