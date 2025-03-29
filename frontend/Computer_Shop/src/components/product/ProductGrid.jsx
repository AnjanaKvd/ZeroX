import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { getProducts } from '../../services/productService';

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
const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data.content); // Access the content array from the response
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
        // Define a minimal set of mock products as fallback
        setProducts([
          { id: 1, name: 'Fallback Product', price: 0, description: 'No products could be loaded' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Computer Shop</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            to={`/product/${product.productId}`} // Updated to use productId
            key={product.productId} // Updated to use productId
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="text-gray-400">No image available</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">{product.brand}</span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <StockStatus inStock={product.stockQuantity} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;