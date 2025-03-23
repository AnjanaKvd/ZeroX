import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../services/productService';
import ProductCard from '../components/common/ProductCard/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    brand: '',
    sortBy: 'name',
    sortDirection: 'asc',
    page: 0,
    size: 12
  });
  const [totalPages, setTotalPages] = useState(0);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories...");
        const data = await getCategories();
        setCategories(data);
        setApiError(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use mock data if API fails
        console.log("Using mock categories due to API error");
        setCategories(MOCK_CATEGORIES);
        setApiError(true);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log("Fetching products with filters:", filters);
        const data = await getProducts(filters);
        setProducts(data.content);
        setTotalPages(data.totalPages);
        setApiError(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Use mock data if API fails
        console.log("Using mock products due to API error");
        setProducts(MOCK_PRODUCTS);
        setTotalPages(1);
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filters]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 0 // Reset to first page when filters change
    }));
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilters(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Computer Shop Products</h1>
        
        {apiError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Warning: Using mock data because the API connection failed. Please make sure your backend server is running.
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters sidebar */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-1/2 border border-gray-300 rounded-md p-2"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-1/2 border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  placeholder="Enter brand name"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Direction
                </label>
                <select
                  name="sortDirection"
                  value={filters.sortDirection}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Products grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <LoadingSpinner />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 0}
                    className="px-4 py-2 mr-2 bg-gray-200 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {filters.page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === totalPages - 1}
                    className="px-4 py-2 ml-2 bg-gray-200 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home; 