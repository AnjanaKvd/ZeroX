import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Search, ChevronsUpDown } from 'lucide-react';
import { 
  getProducts, 
  deleteProduct,
  createProduct,
  updateProduct,
  getProductStats
} from '../services/productService';
import ProductModal from '../components/admin/ProductModal';
import ConfirmModal from '../components/admin/ConfirmModal';
import DashboardStats from '../components/admin/DashboardStats';
import OrderStatusChart from '../components/admin/OrderStatusChart';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import { ErrorMessage} from '../components/auth/FormElements';
import { debounce } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [productStats, setProductStats] = useState({});
  const [modalState, setModalState] = useState({
    showAdd: false,
    showEdit: false,
    showDelete: false,
    selectedProduct: null
  });

  const [filters, setFilters] = useState({
    query: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortDirection: 'asc',
    page: 1,
    pageSize: 20
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts(filters);
      setProducts(data.items || []);
      setTotalItems(data.totalCount || 0);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products");
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchProductStats = useCallback(async () => {
    try {
      const stats = await getProductStats();
      setProductStats(stats);
    } catch (err) {
      console.error("Error fetching product stats:", err);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
      fetchProductStats();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [fetchProducts, fetchProductStats]);

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, query: e.target.value, page: 1 }));
  };

  const handleSort = (column) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortDirection: prev.sortBy === column ? 
        prev.sortDirection === 'asc' ? 'desc' : 'asc' : 'asc'
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleProductSubmit = async (productData) => {
    try {
      if (modalState.selectedProduct) {
        await updateProduct(modalState.selectedProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      fetchProducts();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(modalState.selectedProduct.id);
      fetchProducts();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const openModal = (type, product = null) => {
    setModalState({
      showAdd: type === 'add',
      showEdit: type === 'edit',
      showDelete: type === 'delete',
      selectedProduct: product
    });
  };

  const closeModal = () => {
    setModalState({
      showAdd: false,
      showEdit: false,
      showDelete: false,
      selectedProduct: null
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <button
          onClick={() => openModal('add')}
          className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats productStats={productStats} />

      <OrderStatusChart theme={theme} />
      {/* Search and Filters */}
      <div className="p-4 mb-6 bg-white border border-gray-100 rounded-lg shadow-sm">
        <div className="flex flex-col items-end gap-4 md:flex-row">
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                value={filters.query}
                onChange={handleSearchChange}
                className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search products..."
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <div className="overflow-x-auto bg-white border border-gray-100 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Product', 'SKU', 'Price', 'Stock', 'Actions'].map((header, index) => (
                <th 
                  key={header}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    index === 0 ? 'w-2/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {header}
                    {['Product', 'Price', 'Stock'].includes(header) && (
                      <button 
                        onClick={() => handleSort(header.toLowerCase())}
                        className="hover:text-gray-700"
                      >
                        <ChevronsUpDown size={16} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-6">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${product.stock > 20 ? 'bg-green-100 text-green-800' : 
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-4 py-4 space-x-2 text-sm font-medium">
                    <button
                      onClick={() => openModal('edit', product)}
                      className="text-blue-600 hover:text-blue-900"
                      aria-label="Edit product"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => openModal('delete', product)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Delete product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={filters.page}
        totalItems={totalItems}
        itemsPerPage={filters.pageSize}
        onPageChange={handlePageChange}
        className="mt-6"
      />

      {/* Modals */}
      <ProductModal
        isOpen={modalState.showAdd || modalState.showEdit}
        onClose={closeModal}
        onSubmit={handleProductSubmit}
        product={modalState.selectedProduct}
        mode={modalState.showAdd ? 'add' : 'edit'}
      />

      <ConfirmModal
        isOpen={modalState.showDelete}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
};

export default AdminDashboard;