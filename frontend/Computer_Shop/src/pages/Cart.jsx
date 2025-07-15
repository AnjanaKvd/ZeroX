import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Minus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import PriceDisplay from '../components/common/PriceDisplay';
import { validateCoupon } from '../services/couponService';

const Cart = () => {
  const { 
    cartItems, 
    totalPrice, 
    discountedTotal,
    updateQuantity, 
    removeFromCart, 
    clearCart,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon
  } = useCart();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputCouponCode, setInputCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };
  
  const incrementQuantity = (productId, currentQty) => {
    updateQuantity(productId, currentQty + 1);
  };
  
  const decrementQuantity = (productId, currentQty) => {
    if (currentQty > 1) {
      updateQuantity(productId, currentQty - 1);
    }
  };
  
  const handleRemoveItem = (productId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      removeFromCart(productId);
    }
  };
  
  const handleApplyCoupon = async () => {
    if (!inputCouponCode.trim()) {
      setCouponMessage({ type: 'error', text: 'Please enter a coupon code' });
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      setCouponMessage({ 
        type: 'error', 
        text: 'Please log in to apply a coupon' 
      });
      return;
    }
    
    // Log user object to verify we have userId
    
    setValidatingCoupon(true);
    setCouponMessage(null);
    
    try {
      // Include the user ID in the validation request
      const result = await validateCoupon(
        inputCouponCode,
        totalPrice,
        user.userId // Make sure we're using the correct property name
      );
      
      if (result.valid) {
        // Apply the coupon
        applyCoupon(inputCouponCode, result.discountAmount);
        setCouponMessage({ 
          type: 'success', 
          text: result.message || 'Coupon applied successfully!' 
        });
        setInputCouponCode(''); // Clear the input
      } else {
        setCouponMessage({ 
          type: 'error', 
          text: result.message || 'Invalid coupon code'
        });
      }
    } catch (error) {
      setCouponMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error validating coupon'
      });
    } finally {
      setValidatingCoupon(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage(null);
  };
  
  const handleCheckout = () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      navigate('/login', { state: { from: '/cart' } });
    } else {
      // Proceed to checkout
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-lg text-gray-600 mb-6">Your cart is empty</p>
          <Link 
            to="/products" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b p-4 bg-gray-50">
              <div className="grid grid-cols-6 gap-4 font-medium">
                <div className="col-span-3">Product</div>
                <div className="text-center">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Total</div>
              </div>
            </div>
            
            {cartItems.map(item => {
              const itemId = item.productId || item.id;
              const itemPrice = Number(item.price);
              const itemTotal = itemPrice * item.quantity;
              
              return (
                <div key={itemId} className="border-b p-4">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="col-span-3 flex items-center space-x-4">
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div>
                        <Link 
                          to={`/products/${itemId}`}
                          className="font-medium hover:text-blue-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <PriceDisplay amount={itemPrice} />
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="flex items-center border rounded">
                        <button 
                          onClick={() => decrementQuantity(itemId, item.quantity)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <input 
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value))}
                          className="w-12 text-center py-1 focus:outline-none"
                        />
                        
                        <button 
                          onClick={() => incrementQuantity(itemId, item.quantity)}
                          className="px-2 py-1 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2">
                      <span className="font-medium">
                        <PriceDisplay amount={itemTotal} />
                      </span>
                      <button 
                        onClick={() => handleRemoveItem(itemId)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="p-4 flex justify-between items-center">
              <button 
                onClick={() => clearCart()}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Clear Cart
              </button>
              <Link 
                to="/products" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">
                  <PriceDisplay amount={totalPrice} />
                </span>
              </div>
              
              {/* Show coupon discount if applied */}
              {couponCode && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Coupon: {couponCode}
                  </span>
                  <span className="font-medium">
                    -<PriceDisplay amount={couponDiscount} />
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>
                  <PriceDisplay amount={couponCode ? discountedTotal : totalPrice} />
                </span>
              </div>
            </div>
            
            {/* Coupon Section */}
            <div className="mb-6">
              {couponCode ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <div>
                      <p className="font-medium text-green-700">{couponCode} applied</p>
                      <p className="text-sm text-green-600">
                        You saved <PriceDisplay amount={couponDiscount} />
                      </p>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove coupon"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input 
                      type="text"
                      value={inputCouponCode}
                      onChange={(e) => setInputCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={validatingCoupon}
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
                      disabled={validatingCoupon || !inputCouponCode.trim()}
                    >
                      {validatingCoupon ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-sm ${couponMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                      {couponMessage.text}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 