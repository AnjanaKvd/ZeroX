import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useToast } from './ToastContext';
import {
  getWishlist as fetchWishlist,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
} from '../services/wishlistService';

export const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { success, error: showError } = useToast();

  // Load wishlist from the server
  const loadWishlist = useCallback(async () => {
    console.log('Loading wishlist...');
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await fetchWishlist();
      console.log('Fetched wishlist items:', items);
      setWishlist(items || []);
      return items || [];
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      const errorMsg = err.response?.data?.message;
      setError(errorMsg);
      showError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Add item to wishlist
  const addToWishlist = useCallback(async (productId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const item = await addToWishlistApi(productId);
      setWishlist(prev => {
        // Check if item already exists in wishlist
        const exists = prev.some(i => i.productId === productId);
        return exists ? prev : [...prev, item];
      });
      success('Item added to wishlist');
      return { success: true, data: item };
    } catch (err) {
      if(err.response?.data?.message.includes('Product already exists in wishlist')) {
        showError('Product already exists in wishlist');
        return { success: false, error: 'Product already exists in wishlist' };
      }
      const errorMsg = err.response?.data?.message || 'Please login to add items to your wishlist';
      showError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [success, showError]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (productId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await removeFromWishlistApi(productId);
      setWishlist(prev => prev.filter(item => item.productId !== productId));
      success('Item removed from wishlist');
      return { success: true };
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      const errorMsg = err.response?.data?.message || 'Failed to remove from wishlist';
      showError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [success, showError]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.productId === productId);
  }, [wishlist]);

  // Toggle item in wishlist (add if not present, remove if present)
  const toggleWishlistItem = useCallback(async (productId) => {
    try {
      if (isInWishlist(productId)) {
        return await removeFromWishlist(productId);
      } else {
        return await addToWishlist(productId);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist item:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update wishlist';
      showError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist, showError]);

  // Get wishlist count
  const getWishlistCount = useCallback(() => {
    return wishlist.length;
  }, [wishlist]);

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const value = {
    wishlist,
    isLoading,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlistItem,
    refreshWishlist: loadWishlist,
    getWishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
