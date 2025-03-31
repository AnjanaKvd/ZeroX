import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { getProducts } from '../../services/productService';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';

// Barcode Component
const UPCBarcode = ({ upc }) => {
  const [barcodeDataUrl, setBarcodeDataUrl] = useState('');

  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    try {
      JsBarcode(canvas, upc, {
        format: "UPC",
        width: 2,
        height: 100,
        displayValue: true
      });
      setBarcodeDataUrl(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Barcode generation error:', error);
    }
  }, [upc]);

  return barcodeDataUrl ? (
    <img 
      src={barcodeDataUrl} 
      alt="UPC Barcode" 
      className="w-full max-w-xs mx-auto"
    />
  ) : null;
};

// Stock Status Component
const StockStatus = ({ inStock }) => {
  let statusClass = '';
  let statusText = '';

  if (inStock > 10) {
    statusClass = 'bg-green-100 text-green-800';
    statusText = 'In Stock';
  } else if (inStock > 0 && inStock <= 10) {
    statusClass = 'bg-yellow-100 text-yellow-800';
    statusText = 'Low Stock';
  } else {
    statusClass = 'bg-red-100 text-red-800';
    statusText = 'Out of Stock';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`}>
      {statusText}
    </span>
  );
};

// Updated Product List Component (Grid View)
const ProductGrid = ({ products = [], loading = false }) => {
  // Ensure products is always an array
  const productArray = Array.isArray(products) ? products : [];
  
  if (!loading && productArray.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {productArray.map((product) => (
        <ProductCard 
          key={product.productId || product.id} 
          product={product} 
        />
      ))}
      
      {/* Show empty placeholder cards during loading */}
      {loading && productArray.length === 0 && Array(4).fill(0).map((_, index) => (
        <div 
          key={`skeleton-${index}`} 
          className="bg-gray-100 rounded-lg animate-pulse h-64"
        />
      ))}
    </div>
  );
};

export default ProductGrid;