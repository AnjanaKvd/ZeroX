import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { Plus, Minus, ShoppingCart } from 'lucide-react'; // or your icon library
import { getFullImageUrl, getProductImageUrl } from '../utils/imageUtils';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
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
          <div className="bg-gray-200 rounded-lg h-80 md:h-96 flex items-center justify-center">
            {getProductImageUrl(product) ? (
              <img 
                src={getProductImageUrl(product)} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-gray-500">No image available</span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="text-2xl font-bold text-blue-600 mb-4">
            ${Number(product.price).toFixed(2)}
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <ul className="space-y-2">
              <li><span className="font-medium">Brand:</span> {product.brand}</li>
              <li><span className="font-medium">SKU:</span> {product.sku}</li>
              <li><span className="font-medium">Category:</span> {product.categoryName}</li>
              <li><span className="font-medium">In Stock:</span> {product.stockQuantity}</li>
              {product.warrantyPeriodMonths && <li><span className="font-medium">Warranty:</span> {product.warrantyPeriodMonths} months</li>}
            </ul>
          </div>
          
          {/* Quantity Selector with Plus/Minus Buttons */}
          <div className="flex items-center space-x-2 mb-6">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center border rounded-md">
              <button 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="px-3 py-2 border-r hover:bg-gray-100 disabled:opacity-50"
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
                className="w-16 text-center py-2 focus:outline-none"
              />
              
              <button 
                onClick={incrementQuantity}
                disabled={quantity >= product.stockQuantity}
                className="px-3 py-2 border-l hover:bg-gray-100 disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {product.stockQuantity} available
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.stockQuantity < 1}
            className={`w-full py-3 px-6 rounded-md text-white font-medium flex items-center justify-center gap-2
              ${product.stockQuantity > 0 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'}`}
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