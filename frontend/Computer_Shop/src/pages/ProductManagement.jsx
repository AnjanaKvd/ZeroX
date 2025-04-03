import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Search, ChevronsUpDown, AlertCircle, Package } from 'lucide-react';
import { 
  getProducts, 
  deleteProduct,
  createProduct,
  updateProduct
} from '../services/productService';
import ProductModal from '../components/admin/ProductModal';
import ConfirmModal from '../components/admin/ConfirmModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../components/auth/FormElements';
import { getProductImageUrl } from '../utils/imageUtils';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
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
    brand: '',
    sortBy: 'name',
    sortDirection: 'asc',
    page: 1,
    size: 10
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts(filters);
      setProducts(data.content || []);
      setTotalItems(data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products");
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
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
    setError(null);
  };

  const handleProductSubmit = async (productData) => {
    try {
      if (modalState.selectedProduct) {
        await updateProduct(modalState.selectedProduct.productId, productData);
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
      await deleteProduct(modalState.selectedProduct.productId);
      fetchProducts();
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      sortBy: 'name',
      sortDirection: 'asc',
      page: 1,
      size: 10
    });
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <button
          onClick={() => openModal('add')}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="mr-2" size={18} />
          Add Product
        </button>
      </div>

      {error && (
        <ErrorMessage message={error} className="mb-4" />
      )}

      {/* Advanced Filters */}
      <div className="p-4 mb-6 bg-white rounded-md shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Filters</h2>
          <button 
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Reset All
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                name="query"
                value={filters.query}
                onChange={handleInputChange}
                placeholder="Search products..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={filters.brand}
              onChange={handleInputChange}
              placeholder="Filter by brand"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Min Price
            </label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleInputChange}
              placeholder="Min $"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Max Price
            </label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleInputChange}
              placeholder="Max $"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden bg-white rounded-md shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    <span>Product</span>
                    {filters.sortBy === 'name' && (
                      <ChevronsUpDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                  onClick={() => handleSort('sku')}
                >
                  <div className="flex items-center">
                    <span>SKU</span>
                    {filters.sortBy === 'sku' && (
                      <ChevronsUpDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    <span>Price</span>
                    {filters.sortBy === 'price' && (
                      <ChevronsUpDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
                  onClick={() => handleSort('stockQuantity')}
                >
                  <div className="flex items-center">
                    <span>Stock</span>
                    {filters.sortBy === 'stockQuantity' && (
                      <ChevronsUpDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase"
                >
                  Actions
                </th>
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
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          {getProductImageUrl(product) ? (
                            <img
                              className="object-cover w-10 h-10 rounded"
                              src={getProductImageUrl(product)}
                              alt={product.name}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded">
                              <Package size={18} className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.categoryName}
                          </div>
                        </div>
                        {product.stockQuantity <= (product.lowStockThreshold || 5) && (
                          <div className="ml-2" title="Low stock">
                            <AlertCircle size={16} className="text-amber-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {product.sku}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${product.stockQuantity > (product.lowStockThreshold || 10) ? 'bg-green-100 text-green-800' : 
                          product.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {product.stockQuantity} in stock
                      </span>
                    </td>
                    <td className="px-4 py-4 space-x-2 text-sm font-medium text-right">
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
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={filters.page}
        totalItems={totalItems}
        itemsPerPage={filters.size}
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
        message={`Are you sure you want to delete ${modalState.selectedProduct?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default ProductManagement; 