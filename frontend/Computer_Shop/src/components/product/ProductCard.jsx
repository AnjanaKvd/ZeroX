import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { FiPackage } from 'react-icons/fi';
import { getProductImageUrl } from '../../utils/imageUtils';
import { useTheme } from '../../context/ThemeContext';
import { Spinner } from '../common/LoadingSpinner/Spinner';

// Data URI for a simple gray square with text (doesn't require network)
const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' alignment-baseline='middle' font-family='Arial, sans-serif' fill='%23666666'%3ENo Image%3C/text%3E%3C/svg%3E";

// Format image URL to ensure it's absolute
const formatImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  return `http://localhost:8080${url}`;
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { theme } = useTheme();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      id: product.productId || product.id,
      productId: product.productId || product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl ? formatImageUrl(product.imageUrl) : placeholderImage,
      quantity: 1
    };
    
    addToCart(cartItem);
  };

  // Make sure we have a valid product ID (could be productId or id depending on API source)
  const productId = product.productId || product.id;
  if (!productId) return null;

  // Use the product imageUrl directly if available, otherwise use the image utility
  const rawImageUrl = product.imageUrl || getProductImageUrl(product);
  const imageUrl = rawImageUrl ? formatImageUrl(rawImageUrl) : placeholderImage;

  return (
    <article className={`group relative overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-all duration-300 hover:shadow-md`}>
      <Link to={`/products/${productId}`} className="block h-full">
        {/* Image Container */}
        <div className="relative aspect-square bg-background">
          {imageUrl ? (
            <img 
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = placeholderImage;
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-secondary">
              <FiPackage className="h-12 w-12 opacity-40" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            {product.name}
          </h3>
          
          <p className="mb-3 line-clamp-2 text-sm text-text-secondary">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              ${Number(product.price).toFixed(2)}
            </span>
            
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center rounded-lg bg-primary p-2 text-surface hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCartIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;