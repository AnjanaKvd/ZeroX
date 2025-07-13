import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getProducts } from '../services/productService';
import EnhancedProductGrid from '../components/product/ProductGrid';
import { useCategories } from '../context/CategoriesContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Find the current category
  const category = categories.find(cat => cat.categoryId === categoryId);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!categoryId) {
        console.log('No categoryId provided');
        return;
      }
      
      console.log(`Fetching products for category ID: ${categoryId}`);
      
      try {
        setLoading(true);
        setError(null);
        
        // Use the getProducts function with the categoryId filter
        const response = await getProducts({
          categoryId: categoryId,
          page: 0, // First page (0-based index)
          size: 100 // Default size, adjust as needed
        });
        
        console.log('Products response:', response);
        
        // The response should already be in the correct format
        const productsData = Array.isArray(response.content) ? response.content : [];
        console.log(`Found ${productsData.length} products for category ${categoryId}`);
        setProducts(productsData);
        
      } catch (err) {
        console.error('Error fetching category products:', err);
        setError('Failed to load products for this category');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a valid category ID and categories are loaded
    if (categoriesLoading) {
      console.log('Categories still loading...');
      return;
    }
    
    if (categoryId) {
      fetchCategoryProducts();
    } else if (categories.length > 0) {
      // If no categoryId but we have categories, redirect to the first one
      console.log('No category ID in URL, redirecting to first category');
      navigate(`/categories/${categories[0].categoryId}`, { replace: true });
    } else {
      console.log('No categories available');
      setError('No categories available');
      setLoading(false);
    }
  }, [categoryId, categories, categoriesLoading, navigate]);
  
  // Debug logging
  useEffect(() => {
    console.log('Category ID from URL:', categoryId);
    console.log('Current category:', category);
    console.log('Available categories:', categories);
    console.log('Location state:', location.state);
  }, [categoryId, category, categories, location.state]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link to="/" className="hover:text-primary dark:hover:text-primary-300">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary dark:hover:text-primary-300">Products</Link>
          {category && (
            <>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-white">{category.name}</span>
            </>
          )}
        </nav>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {category ? category.name : 'Category'} Products
          </h1>
          
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {category?.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-6">{category.description}</p>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? 'No products match your search. Try different keywords.'
              : 'There are no products available in this category at the moment.'}
          </p>
        </div>
      ) : (
        <EnhancedProductGrid products={filteredProducts} loading={loading} />
      )}
    </div>
  );
};

export default CategoryProductsPage;
