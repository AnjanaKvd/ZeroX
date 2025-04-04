import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getProducts } from '../services/productService';
import HeroBanner from "../components/home/HeroBanner";
import ProductGrid from '../components/product/ProductGrid';
import FilterPanel from '../components/common/FilterPanel';
import Pagination from '../components/common/Pagination';
import ErrorDisplay from '../components/common/ErrorDisplay';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

const Home = () => {
  const { theme } = useTheme();
  const [state, setState] = useState({
    products: [],
    loading: true,
    error: null,
    pagination: {
      page: 0,
      totalPages: 0,
      totalElements: 0,
      size: 12
    },
    filters: {
      searchQuery: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      pageSize: 12
    }
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const productsResponse = await getProducts();

      setState(prev => ({
        ...prev,
        products: productsResponse.content || [],
        error: null
      }));
    } catch (err) {
      console.error('Data fetch error:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to load data. Please try again later.'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (name, value) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [name]: value,
        page: 1
      }
    }));
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage, state.pagination.size);
  };

  const fetchProducts = async (page = 0, size = 12) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const productsResponse = await getProducts({ page, size });
      
      if (productsResponse?.content) {
        setState(prev => ({
          ...prev,
          products: productsResponse.content,
          pagination: {
            page: productsResponse.pageable?.pageNumber || 0,
            totalPages: productsResponse.totalPages || 1,
            totalElements: productsResponse.totalElements || 0,
            size: productsResponse.pageable?.pageSize || 12
          },
          error: null
        }));
      }
    } catch (err) {
      console.error('Products fetch error:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to load products. Please try again later.',
        products: []
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'}`}>
      <HeroBanner
        title="Custom Gaming PCs & Components"
        subtitle="Build Your Ultimate Gaming Rig"
        ctaText="Shop Now"
        ctaLink="/products"
        theme={theme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterPanel
          filters={state.filters}
          onFilterChange={handleFilterChange}
          theme={theme}
          className="mb-8"
        />

        {state.error && (
          <ErrorDisplay 
            error={state.error}
            onRetry={fetchData}
            theme={theme}
            className="mb-8"
          />
        )}

        <section className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${
            theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
          }`}>
            Featured Products
          </h2>
          
          {state.loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner theme={theme} />
            </div>
          ) : (
            <ProductGrid 
              products={state.products} 
              theme={theme}
            />
          )}
        </section>

        <Pagination
          currentPage={state.pagination.page}
          totalPages={state.pagination.totalPages}
          onPageChange={handlePageChange}
          disabled={state.loading}
          theme={theme}
          className="mt-8"
        />
      </main>
    </div>
  );
};

export default Home;