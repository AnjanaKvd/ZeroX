import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { CartContext } from '../context/CartContext';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const data = await getProductById(productId);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product details', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId]);
  
  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity);
    }
  };
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stockQuantity || 1)) {
      setQuantity(value);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error || 'Product not found'}</p>
            <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md">
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gray-200 flex items-center justify-center p-8">
              {/* Placeholder for product image */}
              <div className="h-64 w-64 flex items-center justify-center border border-gray-300 rounded">
                <span className="text-gray-500">Product Image</span>
              </div>
            </div>
            
            <div className="md:w-1/2 p-8">
              <div className="mb-4">
                <Link to="/" className="text-blue-600 hover:underline text-sm">
                  ← Back to Products
                </Link>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2">
                  {product.category?.name}
                </span>
                <span className="text-gray-600">
                  Brand: {product.brand}
                </span>
              </div>
              
              <p className="text-gray-700 mb-6">{product.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-3">Quantity:</span>
                  <input
                    type="number"
                    min="1"
                    max={product.stockQuantity}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-20 border border-gray-300 rounded-md p-2 mr-4"
                  />
                  
                  <span className={`text-sm ${product.stockQuantity > 5 ? 'text-green-600' : product.stockQuantity > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                    {product.stockQuantity > 5 
                      ? 'In Stock' 
                      : product.stockQuantity > 0 
                        ? `Only ${product.stockQuantity} left!` 
                        : 'Out of Stock'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md mr-4 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                
                <Link to="/cart" className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-md mb-4">
                  Go to Cart
                </Link>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Details</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>SKU: {product.sku}</li>
                  <li>Warranty: {product.warrantyPeriodMonths} months</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetails; 