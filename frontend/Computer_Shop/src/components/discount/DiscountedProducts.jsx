// src/components/discount/DiscountedProducts.jsx
import { useState, useEffect } from 'react';
import { getAllActiveDiscounts } from '../../services/discountService';
import { useTheme } from '../../context/ThemeContext';
import DiscountedProductCard from './DiscountedProductCard';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const DiscountedProducts = () => {
  const { theme } = useTheme();
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllActiveDiscounts();
        setDiscountedProducts(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching discounted products:', err);
        setError('Failed to load discounted products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, []);

  // Render the title section regardless of loading state or errors
  return (
    <section className="mb-8">
      {/* Always render the title with explicit styling */}
      <div className="flex items-center mb-6" style={{ opacity: 1, visibility: 'visible' }}>
        <h2 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
        }`} style={{ display: 'block', opacity: 1 }}>
          Hot Deals
        </h2>
        <span className="ml-3 py-1 px-2 bg-red-500 text-white text-sm font-semibold rounded-md">
          Limited Time
        </span>
      </div>
      
      {/* Conditional content based on state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner theme={theme} />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} theme={theme} />
      ) : discountedProducts.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-gray-500">No deals available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {discountedProducts.map(discount => (
            <DiscountedProductCard 
              key={discount.discountId} 
              discount={discount}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default DiscountedProducts;