import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountCode, setDiscountCode] = useState(null);
  
  useEffect(() => {
    // Load cart from local storage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from local storage', error);
      }
    }
  }, []);
  
  useEffect(() => {
    // Calculate total price
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity, 
      0
    );
    setTotalPrice(total);
    
    // Save cart to local storage
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.productId);
      
      if (existingItem) {
        // Update quantity of existing item
        return prevItems.map(item => 
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { 
          ...product, 
          quantity 
        }];
      }
    });
  };
  
  const removeFromCart = (productId) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.productId !== productId)
    );
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };
  
  const clearCart = () => {
    setCartItems([]);
    setDiscountCode(null);
  };
  
  const applyDiscount = (discount) => {
    setDiscountCode(discount);
  };
  
  return (
    <CartContext.Provider value={{ 
      cartItems, 
      totalPrice, 
      discountCode,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      applyDiscount
    }}>
      {children}
    </CartContext.Provider>
  );
}; 