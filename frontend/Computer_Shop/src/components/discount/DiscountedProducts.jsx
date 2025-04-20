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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner theme={theme} />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} theme={theme} />;
  }

  if (discountedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center mb-6">
        <h2 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
        }`}>
          Hot Deals
        </h2>
        <span className="ml-3 py-1 px-2 bg-red-500 text-white text-sm font-semibold rounded-md">
          Limited Time
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {discountedProducts.map(discount => (
          <DiscountedProductCard 
            key={discount.discountId} 
            discount={discount}
          />
        ))}
      </div>
    </section>
  );
};

export default DiscountedProducts;