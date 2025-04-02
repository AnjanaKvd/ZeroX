import { useState, useEffect } from 'react';
import { getProducts } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ErrorDisplay from '../components/common/ErrorDisplay';

const ProductsListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        setProducts(response.content || response);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Products</h1>
      <ProductGrid products={products} loading={loading} />
    </div>
  );
};

export default ProductsListing; 