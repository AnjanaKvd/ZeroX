import { createContext, useState, useEffect, useContext } from 'react';

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
  }, [cartItems]);

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
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (product.quantity || 1)
        };
        return updatedItems;
      } else {
        // Product doesn't exist, add new item
        // Ensure quantity is at least 1
        const quantity = product.quantity || 1;
        return [...prevItems, { ...product, quantity }];
      }
    });
  };
  
  // Update quantity with validation
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        (item.productId || item.id) === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };
  
  // Remove item with proper refresh
  const removeFromCart = (productId) => {
    setCartItems(prevItems => 
      prevItems.filter(item => (item.productId || item.id) !== productId)
    );
  };
  
  // Clear cart
  const clearCart = () => {
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