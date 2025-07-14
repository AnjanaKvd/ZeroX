import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { getUserAddresses, createAddress } from '../services/addressService';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';
import PriceDisplay from '../components/common/PriceDisplay';
import { CheckCircle } from 'lucide-react';

const Checkout = () => {
  const { cartItems, totalPrice, discountedTotal, couponCode, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [shippingCost, setShippingCost] = useState(null);
  const [taxAmount, setTaxAmount] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.userId) return;
      
      try {
        setLoadingAddresses(true);
        const addressData = await getUserAddresses(user.userId);
        setAddresses(addressData);
        
        // If user has a default address, select it
        const defaultAddress = addressData.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.addressId);
          populateAddressForm(defaultAddress);
        }
      } catch (err) {
        // Silently fail - user can still enter address manually
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user?.userId]);
  
  // Populate form with selected address
  const populateAddressForm = (address) => {
    if (!address) return;
    
    setValue('fullName', address.fullName);
    setValue('addressLine1', address.addressLine1);
    setValue('addressLine2', address.addressLine2 || '');
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('zipCode', address.zipCode);
    setValue('country', address.country);
  };
  
  // Handle address selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find(addr => addr.addressId === addressId);
    populateAddressForm(selectedAddress);
  };
  
  // Handle add new address
  const handleAddNewAddress = () => {
    setIsAddingAddress(true);
    setSelectedAddressId(null);
    reset({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    });
  };
  
  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }
  
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    let newAddressId = selectedAddressId;
    
    try {
      // If adding a new address, save it first
      if (isAddingAddress && user?.userId) {
        try {
          const addressData = {
            fullName: data.fullName,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || '',
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            isDefault: addresses.length === 0 // Make default if no other addresses
          };
          
          // Save the new address and get the address ID
          const newAddress = await createAddress(user.userId, addressData);
          newAddressId = newAddress.addressId;
        } catch (addressErr) {
          setError('Failed to save address. Please try again.');
          setLoading(false);
          return; // Stop the checkout process if address saving fails
        }
      }
      
      // Check if we have a valid address ID
      if (!newAddressId) {
        setError('Please select or add a shipping address');
        setLoading(false);
        return;
      }
      
      // Prepare order data
      const orderData = {
        userId: user.userId,
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity
        })),
        addressId: newAddressId,
        paymentMethod,
        couponCode: couponCode || ""  // Include coupon code if available
      };
      
      // Send order to API
      const order = await createOrder(orderData);
      
      // Log the order ID for debugging
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to order confirmation with the order ID
      navigate(`/order-confirmation/${order.orderId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while processing your order. Please try again.');
      // Show detailed error in console for debugging
      if (err.response) {
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                  
                  {!isAddingAddress && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="text-blue-600 border border-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition text-sm"
                    >
                      Add New Address
                    </button>
                  )}
                </div>
                
                {/* Saved Addresses Section */}
                {!isAddingAddress && !loadingAddresses && addresses.length > 0 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {addresses.map((address) => (
                        <div 
                          key={address.addressId}
                          className={`border rounded-md p-4 cursor-pointer ${
                            selectedAddressId === address.addressId
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => handleAddressSelect(address.addressId)}
                        >
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="addressSelect"
                              checked={selectedAddressId === address.addressId}
                              onChange={() => handleAddressSelect(address.addressId)}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <p className="font-medium">{address.fullName}</p>
                              <p className="text-sm text-gray-600">{address.addressLine1}</p>
                              {address.addressLine2 && (
                                <p className="text-sm text-gray-600">{address.addressLine2}</p>
                              )}
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} {address.zipCode}
                              </p>
                              <p className="text-sm text-gray-600">{address.country}</p>
                              {address.isDefault && (
                                <span className="mt-1 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Use a different address
                    </button>
                  </div>
                )}
                
                {/* Manual Address Form */}
                {(isAddingAddress || addresses.length === 0) && (
                  <>
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
                    
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAddress(false);
                          
                          // If there was a previously selected address, reselect it
                          if (selectedAddressId) {
                            const selectedAddress = addresses.find(addr => addr.addressId === selectedAddressId);
                            if (selectedAddress) {
                              populateAddressForm(selectedAddress);
                            }
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Use a saved address
                      </button>
                    )}
                  </>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CREDIT_CARD"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={() => setPaymentMethod('CREDIT_CARD')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>Credit Card</span>
                  </label>
                  
                  
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH_ON_DELIVERY"
                      checked={paymentMethod === 'CASH_ON_DELIVERY'}
                      onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="border rounded-lg p-4 mb-8">
                  <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span><PriceDisplay amount={totalPrice} /></span>
                    </div>
                    
                    {/* Show coupon discount if applied */}
                    {couponCode && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Coupon: {couponCode}
                        </span>
                        <span>-<PriceDisplay amount={totalPrice - discountedTotal} /></span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>
                        {shippingCost ? <PriceDisplay amount={shippingCost} /> : 'Calculated at checkout'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>
                        {taxAmount ? <PriceDisplay amount={taxAmount} /> : 'Calculated at checkout'}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>
                          <PriceDisplay amount={couponCode ? discountedTotal : totalPrice} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4
                    ${loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    } 
                    text-white rounded-md font-medium transition`}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
      
    </div>
  );
};

export default Checkout; 