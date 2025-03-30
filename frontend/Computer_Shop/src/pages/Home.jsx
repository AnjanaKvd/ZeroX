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
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mock';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  
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

  const fetchData = useCallback(async (useMocks = false) => {
    try {
      setLoading(true);
      setError(null);

      if (useMocks) {
        setCategories(MOCK_CATEGORIES);
        setProducts(MOCK_PRODUCTS);
        setTotalItems(MOCK_PRODUCTS.length);
        return;
      }

      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getProducts(filters)
      ]);

      setCategories(categoriesData);
      setProducts(productsData.items);
      setTotalItems(productsData.totalCount);
    } catch (err) {
      setError(err);
      if (!useMocks) fetchData(true); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const debouncedFetch = useCallback(debounce(fetchData, 500), [fetchData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFilters(prev => ({ ...prev, page: newPage }));
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

        <LoadingOverlay isLoading={loading}>
          <CategorySection 
            categories={categories}
            onSelectCategory={(id) => handleFilterChange('categoryId', id)}
            selectedCategory={filters.categoryId}
            className="my-8"
          />

          <div className="my-8">
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            <ProductGrid products={products} loading={loading} />
          </div>
        </LoadingOverlay>

        <Pagination
          currentPage={filters.page}
          totalItems={totalItems}
          itemsPerPage={filters.pageSize}
          onPageChange={handlePageChange}
          className="mt-8"
        />
      </div>
    </>
  );
};

export default Home;