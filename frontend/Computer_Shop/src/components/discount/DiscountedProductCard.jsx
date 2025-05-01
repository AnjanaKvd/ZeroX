// src/components/discount/DiscountedProductCard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { FiPackage } from 'react-icons/fi';
import { getProductImageUrl } from '../../utils/imageUtils';
import { useTheme } from '../../context/ThemeContext';
import { Spinner } from '../common/LoadingSpinner/Spinner';
import { getProductById } from '../../services/productService';
import PriceDisplay from '../common/PriceDisplay';

const DiscountedProductCard = ({ discount }) => {
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Fetch full product details to get the image
        const productData = await getProductById(discount.productId);
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [discount]);

  useEffect(() => {
    // Update countdown timer
    const calculateTimeLeft = () => {
      const endDate = new Date(discount.endDate);
      const now = new Date();
      const difference = endDate - now;
      
      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      
      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0) timeString += `${hours}h `;
      timeString += `${minutes}m`;
      
      setTimeLeft(timeString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [discount.endDate]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      id: discount.productId,
      productId: discount.productId,
      name: discount.productName,
      price: discount.discountPrice,
      image: product?.imageUrl,
      quantity: 1
    };
    
    addToCart(cartItem);
  };

  if (loading || !product) {
    return (
      <div className="h-80 rounded-lg border border-border bg-surface flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  const imageUrl = product.imageUrl;
  const savingsPercentage = discount.savingsPercentage.toFixed(0);

  return (
    <article className={`group relative overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-all duration-300 hover:shadow-md`}>
      {/* Discount badge */}
      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-md">
        {savingsPercentage}% OFF
      </div>
      
      <Link to={`/products/${discount.productId}`} className="block h-full">
        {/* Image Container */}
        <div className="relative aspect-square bg-background">
          {imageUrl ? (
            <img 
              src={imageUrl}
              alt={discount.productName}
              className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-product.png';
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
            {discount.productName}
          </h3>
          
          {/* Price section with discount */}
          <div className="flex flex-col mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">
              <PriceDisplay amount={Number(discount.discountPrice).toFixed(2)} />
              </span>
              <span className="text-sm line-through text-text-secondary">
                <PriceDisplay amount={Number(discount.originalPrice).toFixed(2)} />
              </span>
            </div>
            
            {/* Time remaining */}
            <div className="flex items-center mt-1 text-sm">
              <span className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} font-medium`}>
                Ends in: {timeLeft}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} font-medium`}>
              Save <PriceDisplay amount={Number(discount.savingsAmount).toFixed(2)} />
            </span>
            
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center rounded-lg bg-primary p-2 text-surface hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`Add ${discount.productName} to cart`}
            >
              <ShoppingCartIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default DiscountedProductCard;