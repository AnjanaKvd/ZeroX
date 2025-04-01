import { useState, useEffect, useCallback } from 'react';
import { debounce } from '../utils/helpers';
import { getProducts, getCategories } from '../services/productService';
import HeroBanner from "../components/home/HeroBanner"
import CategorySection from '../components/home/CategorySection';
import ProductGrid from '../components/product/ProductGrid';
import FilterPanel from '../components/common/FilterPanel';
import Pagination from '../components/common/Pagination';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ErrorDisplay from '../components/common/ErrorDisplay';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

// Create mock data as fallback
const MOCK_PRODUCTS = [
  { id: 1, name: "Sample Product 1", price: 99.99, description: "This is a sample product" },
  { id: 2, name: "Sample Product 2", price: 149.99, description: "Another sample product" },
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0,
    size: 12
  });
  
  const [filters, setFilters] = useState({
    categoryId: '',
    searchQuery: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    pageSize: 12
  });

  // Add a timeout for loading
  useEffect(() => {
    // If still loading after 10 seconds, use mock data
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Data fetch timeout - using mock data");
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Fetch data with better error handling
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch both products and categories
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      
      console.log('Products response:', productsResponse);
      console.log('Categories response:', categoriesResponse);
      
      // Extract products from the content array
      const productItems = productsResponse.content || [];
      setProducts(productItems);
      
      // Set categories directly
      setCategories(categoriesResponse || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      // Always turn off loading
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage, pagination.size);
  };

  // Separate function for fetching products
  const fetchProducts = async (page = 0, size = 12) => {
    try {
      setLoading(true);
      
      // Get products with pagination
      const productsResponse = await getProducts({ page, size });
      
      // Check if response has expected structure
      if (productsResponse && productsResponse.content) {
        setProducts(productsResponse.content);
        setPagination({
          page: productsResponse.pageable?.pageNumber || 0,
          totalPages: productsResponse.totalPages || 1,
          totalElements: productsResponse.totalElements || 0,
          size: productsResponse.pageable?.pageSize || 12
        });
      } else {
        console.error('Unexpected API response format:', productsResponse);
        setError('Received unexpected data format from server');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      // IMPORTANT: Always set loading to false regardless of success/failure
      setLoading(false);
    }
  };

  return (
    <>
      <HeroBanner 
        title="Custom Gaming PCs & Components"
        subtitle="Build Your Ultimate Gaming Rig"
        ctaText="Shop Now"
        ctaLink="/products"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FilterPanel
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          className="my-8"
        />

        {error && (
          <ErrorDisplay 
            error={error}
            onRetry={() => fetchData()}
            className="my-8"
          />
        )}

        {/* <LoadingOverlay isLoading={loading}> */}
          <CategorySection 
            categories={categories}
            onSelectCategory={(id) => handleFilterChange('categoryId', id)}
            selectedCategory={filters.categoryId}
            className="my-8"
          />

          <div className="my-8">
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <ProductGrid products={products} loading={loading} />
            )}
          </div>
        {/* </LoadingOverlay> */}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          disabled={loading}
          className="mt-8"
        />
      </div>
    </>
  );
};

export default Home;
