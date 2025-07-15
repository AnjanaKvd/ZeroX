import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import DiscountedProductCard from '../discount/DiscountedProductCard';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import { getAllActiveDiscounts } from '../../services/discountService';

const EnhancedProductGrid = ({ products = [], loading = false }) => {
  const [discounts, setDiscounts] = useState({});
  const [discountLoading, setDiscountLoading] = useState(true);
  
  // Fetch all active discounts
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setDiscountLoading(true);
        const discountData = await getAllActiveDiscounts();
        
        // Convert discount array to object with productId as key for faster lookup
        const discountMap = {};
        discountData.forEach(discount => {
          discountMap[discount.productId] = discount;
        });
        
        setDiscounts(discountMap);
      } catch (err) {
      } finally {
        setDiscountLoading(false);
      }
    };
    
    fetchDiscounts();
  }, []);

  // Ensure products is always an array
  const productArray = Array.isArray(products) ? products : [];
  
  if (!loading && !discountLoading && productArray.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No products found.
      </div>
    );
  }

  if (loading || discountLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, index) => (
          <div 
            key={`skeleton-${index}`} 
            className="bg-gray-100 rounded-lg animate-pulse h-64"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {productArray.map((product) => {
        const productId = product.productId || product.id;
        const discount = discounts[productId];
        
        if (discount) {
          return (
            <DiscountedProductCard 
              key={productId}
              discount={discount}
            />
          );
        }
        
        return (
          <ProductCard 
            key={productId}
            product={product} 
          />
        );
      })}
    </div>
  );
};

export default EnhancedProductGrid; 