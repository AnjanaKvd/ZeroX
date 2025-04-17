import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Search, ChevronsUpDown, Clock, Calendar } from 'lucide-react';
import { 
  getDiscounts,
  deleteDiscount,
  createDiscount,
  updateDiscount
} from '../services/discountService';
import { getProducts } from '../services/productService';
import DiscountModal from '../components/admin/DiscountModal';
import ConfirmModal from '../components/admin/ConfirmModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../components/auth/FormElements';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({
    showAdd: false,
    showEdit: false,
    showDelete: false,
    selectedDiscount: null
  });

  const [filters, setFilters] = useState({
    query: '',
    status: '', // 'active', 'scheduled', 'expired'
    minDiscountPct: '',
    maxDiscountPct: '',
    sortBy: 'productName',
    sortDirection: 'asc',
    page: 1,
    size: 10
  });

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      // In a real implementation, you would pass filters to the API
      const response = await getDiscounts(filters.page - 1, filters.size);
      setDiscounts(response.content || []);
    } catch (err) {
      console.error("Error fetching discounts:", err);
      setError(err.message || "Failed to load discounts");
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch products for the modal
  const fetchProducts = useCallback(async () => {
    try {
      const response = await getProducts();
      setProducts(response.content || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
    fetchProducts(); // Get products for the discount modal
  }, [fetchDiscounts, fetchProducts]);

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

  const openModal = (type, discount = null) => {
    setModalState({
      showAdd: type === 'add',
      showEdit: type === 'edit',
      showDelete: type === 'delete',
      selectedDiscount: discount
    });
  };

  const closeModal = () => {
    setModalState({
      showAdd: false,
      showEdit: false,
      showDelete: false,
      selectedDiscount: null
    });
    setError(null);
  };

  const handleDiscountSubmit = async (discountData) => {
    try {
      if (modalState.selectedDiscount) {
        await updateDiscount(modalState.selectedDiscount.discountId, discountData);
      } else {
        await createDiscount(discountData);
      }
      fetchDiscounts();
      closeModal();
    } catch (err) {
      setError(err.message || "An error occurred while saving the discount");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDiscount(modalState.selectedDiscount.discountId);
      
      // Update local state to immediately remove the deleted discount
      setDiscounts(prevDiscounts => 
        prevDiscounts.filter(d => d.discountId !== modalState.selectedDiscount.discountId)
      );
      
      // Also refresh from server
      fetchDiscounts();
      closeModal();
    } catch (err) {
      setError(err.message || "An error occurred while deleting the discount");
    }
  };

  const resetFilters = () => {
    setFilters({
      query: '',
      status: '',
      minDiscountPct: '',
      maxDiscountPct: '',
      sortBy: 'productName',
      sortDirection: 'asc',
      page: 1,
      size: 10
    });
  };

  // Filter discounts based on search query
  const filteredDiscounts = discounts.filter(discount => {
    const searchLower = filters.query.toLowerCase();
    const matchesSearch = 
      discount.productName?.toLowerCase().includes(searchLower) ||
      discount.productSku?.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;
    
    // Filter by status
    if (filters.status) {
      const now = new Date();
      const startDate = new Date(discount.startDate);
      const endDate = new Date(discount.endDate);
      
      if (filters.status === 'active' && (now < startDate || now > endDate)) {
        return false;
      } else if (filters.status === 'scheduled' && now >= startDate) {
        return false;
      } else if (filters.status === 'expired' && now <= endDate) {
        return false;
      }
    }
    
    // Filter by discount percentage
    const savingsPercentage = ((discount.originalPrice - discount.discountPrice) / discount.originalPrice) * 100;
    
    if (filters.minDiscountPct && savingsPercentage < Number(filters.minDiscountPct)) {
      return false;
    }
    
    if (filters.maxDiscountPct && savingsPercentage > Number(filters.maxDiscountPct)) {
      return false;
    }
    
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getDiscountStatus = (discount) => {
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);
    
    if (now >= startDate && now <= endDate) {
      return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-800' };
    } else if (now < startDate) {
      return { status: 'scheduled', label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Discount Management</h1>
        <button
          onClick={() => openModal('add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="mr-2" size={18} />
          Add Discount
        </button>
      </div>

      {error && (
        <ErrorMessage message={error} className="mb-4" />
      )}

      {/* Advanced Filters */}
      <div className="bg-white p-4 mb-6 rounded-md shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Filters</h2>
          <button 
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Reset All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                name="query"
                value={filters.query}
                onChange={handleInputChange}
                placeholder="Search by product name or SKU..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Discount %
            </label>
            <input
              type="number"
              name="minDiscountPct"
              value={filters.minDiscountPct}
              onChange={handleInputChange}
              placeholder="Min %"
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Discount %
            </label>
            <input
              type="number"
              name="maxDiscountPct"
              value={filters.maxDiscountPct}
              onChange={handleInputChange}
              placeholder="Max %"
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white shadow-md rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('productName')}
                >
                  <div className="flex items-center">
                    <span>Product</span>
                    {filters.sortBy === 'productName' && (
                      <ChevronsUpDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('originalPrice')}
                >
                  <div className="flex items-center">
                    <span>Original Price</span>
                    {filters.sortBy === 'originalPrice' && (
                      <ChevronsUpDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('discountPrice')}
                >
                  <div className="flex items-center">
                    <span>Discount Price</span>
                    {filters.sortBy === 'discountPrice' && (
                      <ChevronsUpDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Savings
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('startDate')}
                >
                  <div className="flex items-center">
                    <span>Start Date</span>
                    {filters.sortBy === 'startDate' && (
                      <ChevronsUpDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('endDate')}
                >
                  <div className="flex items-center">
                    <span>End Date</span>
                    {filters.sortBy === 'endDate' && (
                      <ChevronsUpDown size={16} className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                    No discounts found
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((discount) => {
                  const savingsAmount = discount.originalPrice - discount.discountPrice;
                  const savingsPercentage = (savingsAmount / discount.originalPrice) * 100;
                  const status = getDiscountStatus(discount);
                  
                  return (
                    <tr key={discount.discountId} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {discount.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {discount.productSku}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${discount.originalPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${discount.discountPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          ${savingsAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-green-600">
                          {savingsPercentage.toFixed(1)}% off
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(discount.startDate)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(discount.endDate)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal('edit', discount)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit discount"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openModal('delete', discount)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete discount"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && discounts.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={filters.page}
            totalPages={Math.ceil(discounts.length / filters.size)}
            onPageChange={handlePageChange}
            disabled={loading}
            className="pagination-bar"
          />
        </div>
      )}

      {/* Modals */}
      {(modalState.showAdd || modalState.showEdit) && (
        <DiscountModal
          isOpen={modalState.showAdd || modalState.showEdit}
          onClose={closeModal}
          onSubmit={handleDiscountSubmit}
          discount={modalState.selectedDiscount}
          mode={modalState.showAdd ? 'add' : 'edit'}
          products={products}
        />
      )}

      {modalState.showDelete && (
        <ConfirmModal
          isOpen={modalState.showDelete}
          onClose={closeModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Discount"
          message={`Are you sure you want to delete the discount for "${modalState.selectedDiscount?.productName}"? This action cannot be undone.`}
          confirmButtonText="Delete Discount"
          confirmButtonColor="red"
        />
      )}
    </div>
  );
};

export default DiscountManagement; 