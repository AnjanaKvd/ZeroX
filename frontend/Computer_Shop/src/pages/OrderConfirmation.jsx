import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);
  
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
            <Link to="/" className="text-blue-600 hover:underline">
              Return to Home
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
        <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-green-100 text-green-800 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Order Details</h2>
            <div className="border border-gray-200 rounded-md p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Order Number</p>
                  <p className="font-medium">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Order Date</p>
                  <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Payment Method</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Order Status</p>
                  <p className="font-medium">{order.status}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Items Ordered</h2>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Product</th>
                    <th className="text-center p-4">Quantity</th>
                    <th className="text-right p-4">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-4">{item.productName}</td>
                      <td className="text-center p-4">{item.quantity}</td>
                      <td className="text-right p-4">${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td colSpan="2" className="text-right p-4 font-medium">Total</td>
                    <td className="text-right p-4 font-bold">${order.totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md">
              Continue Shopping
            </Link>
            <Link to="/orders" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-3 rounded-md">
              View All Orders
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation; 