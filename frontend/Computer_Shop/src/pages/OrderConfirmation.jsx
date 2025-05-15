import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../services/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import PriceDisplay from '../components/common/PriceDisplay';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  console.log("Received order ID:", orderId);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        console.log("Fetching order details for ID:", orderId);
        const data = await getOrderById(orderId);
        console.log("Order details received:", data);
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
    } else {
      console.error("No order ID provided");
      setError("No order ID provided");
      setLoading(false);
    }
  }, [orderId]);
  
  // Function to process payment
  const processPayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mark payment as completed
    setPaymentStatus('completed');
    
    // Update order status in backend
    try {
      // Use the proper status values from the API docs: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
      await updateOrderStatus(orderId, 'PROCESSING');
      // Refresh order data
      const updatedOrder = await getOrderById(orderId);
      setOrder(updatedOrder);
    } catch (err) {
      console.error('Error updating order status', err);
    }
    
    setPaymentProcessing(false);
  };
  
  // Validate credit card form
  const validateCreditCardForm = () => {
    return (
      cardNumber.replace(/\s/g, '').length === 16 &&
      expiryDate.length === 5 &&
      cvv.length === 3 &&
      cardName.trim().length > 0
    );
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 py-8">
          <LoadingSpinner />
        </main>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen">
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
      </div>
    );
  }
  
  // Render payment gateway based on payment method
  const renderPaymentGateway = () => {
    if (paymentStatus === 'completed') {
      return (
        <div className="border border-green-200 bg-green-50 rounded-md p-6 mb-6">
          <div className="flex items-center">
            <div className="bg-green-100 text-green-800 rounded-full h-10 w-10 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
              <p className="text-green-700">Your payment has been processed successfully.</p>
            </div>
          </div>
        </div>
      );
    }
    
    switch (order.paymentMethod) {
      case 'CREDIT_CARD':
        return (
          <div className="border border-gray-200 rounded-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  value={cardNumber}
                  onChange={(e) => {
                    const input = e.target.value.replace(/\D/g, '');
                    const formatted = input.replace(/(\d{4})/g, '$1 ').trim();
                    setCardNumber(formatted);
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="MM/YY"
                    maxLength="5"
                    value={expiryDate}
                    onChange={(e) => {
                      let input = e.target.value.replace(/\D/g, '');
                      if (input.length > 2) {
                        input = input.substring(0, 2) + '/' + input.substring(2);
                      }
                      setExpiryDate(input);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123"
                    maxLength="3"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <button
                onClick={processPayment}
                disabled={!validateCreditCardForm() || paymentProcessing}
                className={`w-full py-2 px-4 rounded-md font-medium transition ${
                  validateCreditCardForm() && !paymentProcessing
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {paymentProcessing ? 'Processing...' : `Pay `} <PriceDisplay amount={order.totalAmount} />
              </button>
            </div>
          </div>
        );
        
      case 'CASH_ON_DELIVERY':
        return (
          <div className="border border-gray-200 rounded-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Cash on Delivery</h3>
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 text-yellow-800 rounded-full h-10 w-10 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700">Your order will be delivered soon. Please have the payment amount ready when the courier arrives.</p>
                <p className="text-gray-700 mt-1">Amount to pay: <span className="font-bold">
  <PriceDisplay amount={order.totalAmount} />
</span></p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
            >
              Continue Shopping
            </button>
          </div>
        );
        
      default:
        return (
          <div className="border border-gray-200 rounded-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
            <p className="text-gray-700">Please proceed with payment using your selected payment method.</p>
            <button
              onClick={processPayment}
              disabled={paymentProcessing}
              className={`w-full mt-4 py-2 px-4 rounded-md font-medium transition ${
                paymentProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {paymentProcessing ? 'Processing...' : `Pay $${order.totalAmount.toFixed(2)}`}
            </button>
          </div>
        );
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="bg-green-100 text-green-800 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>
          
          {/* Payment Gateway */}
          {renderPaymentGateway()}
          
          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
          
          {/* Items Ordered */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
                      <td className="text-right p-4">
  <PriceDisplay amount={item.subtotal} />
</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td colSpan="2" className="text-right p-4 font-medium">Total</td>
                    <td className="text-right p-4 font-bold">
  <PriceDisplay amount={order.totalAmount} />
</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
            <div className="border border-gray-200 rounded-md p-4">
              {/* Log the data to see what's available */}
              {console.log("Order data:", order)}
              
              {/* Try multiple possible address properties the API might return */}
              {order.address ? (
                <>
                  <p className="font-medium">{order.address.fullName}</p>
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                  <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                  <p>{order.address.country}</p>
                </>
              ) : order.shippingAddress ? (
                <>
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </>
              ) : (
                // Fallback to manually construct address if available in a different format
                <div>
                  <p className="text-gray-700">We're getting your order ready to ship to:</p>
                  <p className="mt-2">
                    {/* Try to display any available address information */}
                    {order.customerName || order.customer?.name || ""}
                    <br />
                    {order.customerEmail || ""}
                  </p>
                  <p className="text-gray-500 mt-2">
                    Full address details will be available when your order is processed.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md">
              Continue Shopping
            </Link>
            <Link to="/order-history" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-3 rounded-md">
              View All Orders
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation; 