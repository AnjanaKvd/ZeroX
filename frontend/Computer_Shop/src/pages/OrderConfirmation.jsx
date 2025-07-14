import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../services/orderService';
import { getAddressById } from '../services/addressService';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import PriceDisplay from '../components/common/PriceDisplay';
import { StripePaymentWrapper } from '../components/payment/StripePayment';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  console.log("Received order ID:", orderId);

  // Fetch shipping address when order is loaded or changes
  useEffect(() => {
    const fetchShippingAddress = async () => {
      if (order?.shippingAddressId) {
        try {
          setLoadingAddress(true);
          const address = await getAddressById(order.shippingAddressId);
          setShippingAddress(address);
        } catch (err) {
          console.error('Error fetching shipping address', err);
          // Don't show error to user as the order can still be displayed without address
        } finally {
          setLoadingAddress(false);
        }
      }
    };

    fetchShippingAddress();
  }, [order?.shippingAddressId]);

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

  // Handle successful payment
  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setPaymentProcessing(true);

      // Update order status to PROCESSING after successful payment
      await updateOrderStatus(orderId, 'PROCESSING');

      // Mark payment as completed
      setPaymentStatus('completed');

      // Refresh order data
      const updatedOrder = await getOrderById(orderId);
      setOrder(updatedOrder);

    } catch (err) {
      console.error('Error updating order status after payment', err);
      setError('Payment was successful but there was an error updating your order status. Please contact support.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Handle payment error
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || 'Payment failed. Please try again.');
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
              <h3 className="text-lg font-medium text-green-800">Payment Successful</h3>
              <p className="text-green-700">Your payment has been processed successfully.</p>
            </div>
          </div>
        </div>
      );
    }

    switch (order.paymentMethod) {
      case 'CREDIT_CARD':
        return (
          <div className="mt-6 p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">Pay with Credit Card</h3>
            <StripePaymentWrapper 
              orderId={orderId} 
              amount={order.totalAmount} 
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        );

      case 'CASH_ON_DELIVERY':
        return (
          <div className="mt-6 p-6 border rounded-lg bg-blue-50">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Cash on Delivery</h3>
            <p className="text-blue-700">
              You'll pay when you receive your order. Our delivery agent will collect the payment at the time of delivery.
            </p>
            <div className="mt-4 p-4 bg-white rounded border border-blue-200">
              <p className="text-sm text-blue-600">
                <strong>Note:</strong> Please have the exact amount ready for the delivery person.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="mt-6 p-6 border border-yellow-200 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Payment Method Not Supported</h3>
            <p className="text-gray-700">The selected payment method is not supported. Please contact support for assistance.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
            >
              Return to Home
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
                renderShippingAddress()
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