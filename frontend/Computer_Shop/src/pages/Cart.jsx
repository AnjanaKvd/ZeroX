import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Minus, Trash2 } from 'lucide-react'; // or your icon library
import PriceDisplay from '../components/common/PriceDisplay';

const Cart = () => {
  const { cartItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState(null);
  
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
  
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage({ type: 'error', text: 'Please enter a discount code' });
      return;
    }
    
    try {
      // Here you would normally verify the discount code with your API
      // For now, we'll just simulate a successful response
      setDiscountMessage({ type: 'success', text: 'Discount code applied successfully!' });
    } catch (error) {
      setDiscountMessage({ type: 'error', text: 'Invalid discount code' });
    }
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
                  <PriceDisplay amount={totalPrice} />
                </span>
              </div>
            </div>
            
            {/* Discount Code */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <input 
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Discount code"
                  className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleApplyDiscount}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
                >
                  Apply
                </button>
              </div>
              {discountMessage && (
                <p className={`mt-2 text-sm ${discountMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {discountMessage.text}
                </p>
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