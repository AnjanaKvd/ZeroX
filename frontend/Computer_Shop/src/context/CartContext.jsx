import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useToast } from './ToastContext';

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [couponCode, setCouponCode] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const { cartAdded, cartRemoved, success, error } = useToast();
  
  // Refs to track cart operations
  const pendingToastRef = useRef(null);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        setCartItems([]);
      }
    }
    
    // Load coupon details if available
    const savedCoupon = localStorage.getItem('coupon');
    if (savedCoupon) {
      try {
        const parsedCoupon = JSON.parse(savedCoupon);
        setCouponCode(parsedCoupon.code);
        setCouponDiscount(parsedCoupon.discount);
      } catch (error) {
        setCouponCode(null);
        setCouponDiscount(0);
      }
    }
  }, []);
  
  // Calculate total price whenever cart changes
  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) * item.quantity),
      0
    );
    setTotalPrice(total);
    
    // Calculate discounted total
    const discountAmount = Math.min(couponDiscount, total);  // Don't allow negative totals
    setDiscountedTotal(total - discountAmount);
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Show toast if we have a pending operation
    if (pendingToastRef.current) {
      const { type, message } = pendingToastRef.current;
      if (type === 'added') {
        cartAdded(message);
      } else if (type === 'removed') {
        cartRemoved(message);
      } else if (type === 'updated') {
        success(message);
      }
      pendingToastRef.current = null;
    }
  }, [cartItems, couponDiscount, cartAdded, cartRemoved, success]);

  // Add item to cart with proper duplicate handling
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Use productId or id for consistency
      const productId = product.productId || product.id;
      
      // Check if product already exists in cart
      const existingItemIndex = prevItems.findIndex(
        item => (item.productId || item.id) === productId
      );
      
      if (existingItemIndex >= 0) {
        // Product exists, update quantity
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + (product.quantity || 1);
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity
        };
        
        // Queue toast notification for updated quantity
        pendingToastRef.current = { 
          type: 'updated', 
          message: `${product.name}: qty ${newQuantity}` 
        };
        
        return updatedItems;
      } else {
        // Product doesn't exist, add new item
        // Ensure quantity is at least 1
        const quantity = product.quantity || 1;
        
        // Queue toast notification for added item
        pendingToastRef.current = { 
          type: 'added', 
          message: `${product.name} added to cart` 
        };
        
        return [...prevItems, { ...product, quantity }];
      }
    });
  };
  
  // Update quantity with validation
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    setCartItems(prevItems => {
      const itemToUpdate = prevItems.find(item => (item.productId || item.id) === productId);
      if (itemToUpdate) {
        pendingToastRef.current = { 
          type: 'updated', 
          message: `${itemToUpdate.name}: qty ${newQuantity}` 
        };
      }
      
      return prevItems.map(item => {
        const itemId = item.productId || item.id;
        if (itemId === productId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };
  
  // Remove item with proper refresh
  const removeFromCart = (productId) => {
    // Find the item being removed to get its name for the toast
    const itemToRemove = cartItems.find(item => 
      (item.productId || item.id) === productId
    );
    
    if (itemToRemove) {
      pendingToastRef.current = { 
        type: 'removed', 
        message: `Removed: ${itemToRemove.name}` 
      };
      
      setCartItems(prevItems => 
        prevItems.filter(item => (item.productId || item.id) !== productId)
      );
    }
  };
  
  // Clear cart and coupon
  const clearCart = () => {
    pendingToastRef.current = { 
      type: 'updated', 
      message: 'Cart cleared' 
    };
    setCartItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
    localStorage.removeItem('cart');
    localStorage.removeItem('coupon');
  };
  
  // Apply coupon to cart
  const applyCoupon = (code, discount) => {
    setCouponCode(code);
    setCouponDiscount(discount);
    
    // Save coupon to localStorage
    localStorage.setItem('coupon', JSON.stringify({ code, discount }));
    
    pendingToastRef.current = { 
      type: 'updated', 
      message: `Coupon ${code} applied` 
    };
  };
  
  // Remove coupon from cart
  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
    localStorage.removeItem('coupon');
    
    pendingToastRef.current = { 
      type: 'updated', 
      message: 'Coupon removed' 
    };
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      totalPrice,
      discountedTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      couponCode,
      couponDiscount,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
}; 