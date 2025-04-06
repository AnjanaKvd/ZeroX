import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { Plus, Minus, ShoppingCart } from 'lucide-react'; // or your icon library
import { getFullImageUrl, getProductImageUrl } from '../utils/imageUtils';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) return;
    if (product && value > product.stockQuantity) return;
    setQuantity(value);
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(prevQty => prevQty + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQty => prevQty - 1);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const cartItem = {
        id: product.productId || product.id,
        productId: product.productId || product.id,
        name: product.name,
        price: product.price,
        image: product.imagePath || product.image,
        quantity: quantity
      };
      
      addToCart(cartItem);
      navigate('/cart');
    }
  };

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorDisplay message={error} />;
  if (!product) return <ErrorDisplay message="Product not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className={`rounded-lg h-80 md:h-96 flex items-center justify-center ${
            theme === 'dark' ? 'bg-surface-dark border border-border' : 'bg-gray-100'
          }`}>
            {getProductImageUrl(product) ? (
              <img 
                src={getProductImageUrl(product)} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-500'}>
                No image available
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2">
          <h1 className={`text-3xl font-bold mb-4 ${
            theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
          }`}>
            {product.name}
          </h1>
          <div className="text-2xl font-bold text-primary mb-4">
            ${Number(product.price).toFixed(2)}
          </div>
          
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
            }`}>
              Description
            </h2>
            <p className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}>
              {product.description}
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
            }`}>
              Details
            </h2>
            <ul className="space-y-2">
              <li className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                }`}>
                  Brand:
                </span> {product.brand}
              </li>
              <li className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                }`}>
                  SKU:
                </span> {product.sku}
              </li>
              <li className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                }`}>
                  Category:
                </span> {product.categoryName}
              </li>
              <li className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                }`}>
                  In Stock:
                </span> {product.stockQuantity}
              </li>
              {product.warrantyPeriodMonths && (
                <li className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}>
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                  }`}>
                    Warranty:
                  </span> {product.warrantyPeriodMonths} months
                </li>
              )}
            </ul>
          </div>
          
          {/* Quantity Selector with Plus/Minus Buttons */}
          <div className="flex items-center space-x-2 mb-6">
            <span className={`font-medium ${
              theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
            }`}>
              Quantity:
            </span>
            <div className={`flex items-center border rounded-md ${
              theme === 'dark' ? 'border-border' : 'border-gray-300'
            }`}>
              <button 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className={`px-3 py-2 border-r ${
                  theme === 'dark' 
                    ? 'border-border hover:bg-surface-dark disabled:opacity-50' 
                    : 'border-gray-300 hover:bg-gray-100 disabled:opacity-50'
                } ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'}`}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <input 
                type="number" 
                min="1" 
                max={product.stockQuantity}
                value={quantity}
                onChange={handleQuantityChange}
                className={`w-16 text-center py-2 focus:outline-none ${
                  theme === 'dark' ? 'bg-surface-dark text-text-dark-primary' : 'bg-white text-text-light-primary'
                }`}
              />
              
              <button 
                onClick={incrementQuantity}
                disabled={quantity >= product.stockQuantity}
                className={`px-3 py-2 border-l ${
                  theme === 'dark' 
                    ? 'border-border hover:bg-surface-dark disabled:opacity-50' 
                    : 'border-gray-300 hover:bg-gray-100 disabled:opacity-50'
                } ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'}`}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className={theme === 'dark' ? 'text-sm text-text-dark-secondary' : 'text-sm text-gray-500'}>
              {product.stockQuantity} available
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.stockQuantity < 1}
            className={`w-full py-3 px-6 rounded-md text-white font-medium flex items-center justify-center gap-2
              ${product.stockQuantity > 0 
                ? 'bg-primary hover:bg-primary-hover' 
                : `${theme === 'dark' ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-400 cursor-not-allowed'}`
              }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;