import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart, discountCode } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });
  
  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }
  
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod,
        shippingAddress: {
          fullName: data.fullName,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || '',
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country
        },
        discountCode: discountCode?.code
      };
      
      // Send order to API
      const order = await createOrder(orderData);
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to order confirmation
      navigate(`/order-confirmation/${order.orderId}`);
    } catch (err) {
      console.error('Error creating order', err);
      setError(err.response?.data?.message || 'An error occurred while processing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      {...register('fullName', { required: 'Full name is required' })}
                      className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    {...register('phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^\d{10,15}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                
                <div className="mb-4">
                  <label htmlFor="addressLine1" className="block text-gray-700 font-medium mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    {...register('addressLine1', { required: 'Address is required' })}
                    className={`w-full border ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-500 text-sm mt-1">{errors.addressLine1.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="addressLine2" className="block text-gray-700 font-medium mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    {...register('addressLine2')}
                    className={`w-full border ${errors.addressLine2 ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    {...register('city', { required: 'City is required' })}
                    className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="state" className="block text-gray-700 font-medium mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    {...register('state', { required: 'State is required' })}
                    className={`w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="zipCode" className="block text-gray-700 font-medium mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    {...register('zipCode', { required: 'Zip code is required' })}
                    className={`w-full border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="country" className="block text-gray-700 font-medium mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    {...register('country', { required: 'Country is required' })}
                    className={`w-full border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="paymentMethod" className="block text-gray-700 font-medium mb-2">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={`w-full border ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'} rounded-md p-3`}
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition duration-300 disabled:opacity-70"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout; 