import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';

const Cart = () => {
  const { cartItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState(null);
  
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Cart items */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-4">Product</th>
                      <th className="text-center p-4">Price</th>
                      <th className="text-center p-4">Quantity</th>
                      <th className="text-center p-4">Total</th>
                      <th className="text-center p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.productId} className="border-t border-gray-200">
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded flex items-center justify-center mr-4">
                              <span className="text-gray-500 text-xs">Image</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">{item.name}</h3>
                              <p className="text-gray-600 text-sm">{item.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center p-4">${item.price.toFixed(2)}</td>
                        <td className="text-center p-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="px-2 py-1 bg-gray-200 rounded-l-md"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                              className="w-12 text-center border-t border-b border-gray-200 py-1"
                            />
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="px-2 py-1 bg-gray-200 rounded-r-md"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-center p-4 font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="text-center p-4">
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Link to="/" className="text-blue-600 hover:underline">
                  ← Continue Shopping
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your cart?')) {
                      clearCart();
                    }
                  }}
                  className="text-red-600 hover:underline"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              {/* Cart summary */}
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
                  <label htmlFor="discountCode" className="block text-gray-700 font-medium mb-2">
                    Discount Code
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="discountCode"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-grow border border-gray-300 rounded-l-md p-3"
                      placeholder="Enter code"
                    />
                    <button
                      onClick={handleApplyDiscount}
                      className="bg-gray-200 hover:bg-gray-300 px-4 rounded-r-md"
                    >
                      Apply
                    </button>
                  </div>
                  {discountMessage && (
                    <p className={`text-sm mt-1 ${discountMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                      {discountMessage.text}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition duration-300"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart; 