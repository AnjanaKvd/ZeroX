import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { getActiveDiscountForProduct } from '../services/discountService';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { getProductImageUrl } from '../utils/imageUtils';
import DisplayRatingAndReviews from './DisplayRatingAndReviews';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import PriceDisplay from '../components/common/PriceDisplay';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [product, setProduct] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [refreshRatings, setRefreshRatings] = useState(false);
  const [isReviewItemOpen, setIsReviewItemOpen] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const openReviewForm = () => setIsReviewFormOpen(true);
  const closeReviewForm = () => setIsReviewFormOpen(false);
  const closeReviewItem = () => setIsReviewItemOpen(false);
  
  const toggleReviews = () => {
    setShowReviews((prevState) => !prevState);
  };

  const handleReviewSubmit = () => {
    closeReviewForm();
    setRefreshRatings(prev => !prev);
  };

  useEffect(() => {
    const fetchProductAndDiscount = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);

        try {
          const discountData = await getActiveDiscountForProduct(id);
          setDiscount(discountData);
        } catch (discountErr) {
          console.error('Error fetching discount:', discountErr);
          setDiscount(null);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndDiscount();
  }, [id]);

  useEffect(() => {
    if (!discount) return;

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
      if (hours > 0 || days > 0) timeString += `${hours}h `;
      timeString += `${minutes}m`;

      setTimeLeft(timeString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [discount]);

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
        price: discount ? discount.discountPrice : product.price,
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
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Left Column - Image and Reviews */}
        <div className="md:w-1/2">
          <div className={`rounded-lg h-80 md:h-96 flex items-center justify-center ${
            theme === 'dark' ? 'bg-surface-dark border border-border' : 'bg-gray-100'
          }`}>
            {getProductImageUrl(product) ? (
              <img 
                src={getProductImageUrl(product)} 
                alt={product.name} 
                className="object-contain max-w-full max-h-full"
              />
            ) : (
              <span className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-500'}>
                No image available
              </span>
            )}
          </div>
          {/* Display Rating & Reviews Section */}
          <div className="mt-6 p-4 border rounded-lg shadow-sm bg-white dark:bg-surface-dark">
          
            <h3
              className="text-xl font-semibold mb-4 text-center text-blue-400 underline cursor-pointer"
              onClick={openReviewForm}
            >
              Rate this product 
            </h3>
            {/* The reviews section */}
            <div className="flex justify-center">
              <div className="w-full md:w-4/5 lg:w-3/4 xl:w-2/3">
                <DisplayRatingAndReviews
                  productId={id}
                  refresh={refreshRatings}
                />
                {/* Show Reviews on button click */}
                {showReviews ? (
                  <>
                    {/* Show all reviews */}
                    {product.reviews && product.reviews.length > 0 ? (
                      <ReviewItem productId={id} />
                    ) : (
                      <br />
                    )}
                  </>
                ) : null}

                {/* Hide reviews by default and show a "See All Reviews" link */}
                {!showReviews && (
                  <div
                    className={`text-center cursor-pointer text-blue-500 underline mt-4`}
                    onClick={toggleReviews}
                  >
                    See All Reviews
                  </div>
                )}

                {showReviews && (
                  <div className="mt-6">
                    <ReviewItem productId={id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="md:w-1/2">
          <h1 className={`text-3xl font-bold mb-4 ${
            theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
          }`}>
            {product.name}
          </h1>

          {/* Price Section */}
          <div className="mb-4">
            {discount ? (
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-primary">
                    <PriceDisplay amount={discount.discountPrice} />
                  </div>
                  <div className="text-lg line-through text-text-secondary">
                    <PriceDisplay amount={discount.originalPrice} />
                  </div>
                  <span className="px-2 py-1 text-sm font-semibold text-white bg-red-500 rounded-md">
                    {discount.savingsPercentage.toFixed(0)}% OFF
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    You save: <PriceDisplay amount={discount.savingsAmount} />
                  </span>
                </div>
                {timeLeft && (
                  <div className="mt-1 text-sm">
                    <span className={`font-medium ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                      Offer ends in: {timeLeft}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-2xl font-bold text-primary">
                <PriceDisplay amount={product.price} />
              </div>
            )}
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
                <span className={`font-medium ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'}`}>
                  Brand:
                </span> {product.brand}
              </li>
              <li className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}>
                <span className={`font-medium ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'}`}>
                  SKU:
                </span> {product.sku}
              </li>
              <li className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}>
                <span className={`font-medium ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'}`}>
                  Category:
                </span> {product.categoryName}
              </li>
              <li className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}>
                <span className={`font-medium ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'}`}>
                  In Stock:
                </span> {product.stockQuantity}
              </li>
              {product.warrantyPeriodMonths && (
                <li className={theme === 'dark' ? 'text-text-dark-secondary' : 'text-gray-700'}>
                  <span className={`font-medium ${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'}`}>
                    Warranty:
                  </span> {product.warrantyPeriodMonths} months
                </li>
              )}
            </ul>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center mb-6 space-x-2">
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
                <Minus className="w-4 h-4" />
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
                <Plus className="w-4 h-4" />
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
            <ShoppingCart className="w-5 h-5" />
            {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Review Form Modal */}
      {isReviewFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-3xl p-6 mx-auto bg-white rounded-lg shadow-lg dark:bg-surface-dark">
            <button
              onClick={closeReviewForm}
              className="absolute text-gray-500 top-2 right-2 hover:text-gray-700 dark:text-gray-300"
            >
              ✕
            </button>
            <ReviewForm
              productId={id}
              onReviewSubmit={handleReviewSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;

