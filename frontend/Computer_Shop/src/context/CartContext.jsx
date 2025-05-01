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
  const [discountCode, setDiscountCode] = useState(null);
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
        console.error('Failed to parse cart from localStorage:', error);
        setCartItems([]);
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
  }, [cartItems, cartAdded, cartRemoved, success]);

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
  
  // Clear cart
  const clearCart = () => {
    pendingToastRef.current = { 
      type: 'updated', 
      message: 'Cart cleared' 
    };
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      totalPrice,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      discountCode,
      setDiscountCode
    }}>
      {children}
    </CartContext.Provider>
  );
}; 