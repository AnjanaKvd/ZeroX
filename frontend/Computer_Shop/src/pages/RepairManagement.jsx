import React, { useState, useEffect, useCallback } from 'react';
import { Link } from "react-router-dom";
import { 
  getAllRepairRequests, 
  updateRepairStatus, 
  updateRepairDetails, 
  getRepairRequestById,
  deleteRepairRequest
} from "../services/repairService";
import { useAuth } from "../context/AuthContext";
import { Trash2, Edit, Search, ChevronsUpDown } from 'lucide-react';
import ConfirmModal from '../components/admin/ConfirmModal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../components/auth/FormElements';

const StatusBadge = ({ status }) => {
  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    DIAGNOSTIC: "bg-blue-100 text-blue-800",
    AWAITING_APPROVAL: "bg-purple-100 text-purple-800",
    PARTS_ORDERED: "bg-indigo-100 text-indigo-800",
    IN_PROGRESS: "bg-orange-100 text-orange-800",
    TESTING: "bg-teal-100 text-teal-800",
    READY_FOR_PICKUP: "bg-green-100 text-green-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const RepairManagement = () => {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [modalState, setModalState] = useState({
    showEdit: false,
    showDelete: false,
    selectedRepair: null
  });

  const [filters, setFilters] = useState({
    query: '',
    status: '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
    page: 1,
    pageSize: 10
  });

  const fetchRepairs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllRepairRequests(filters);
      setRepairs(Array.isArray(data) ? data : data.content || []);
      setTotalItems(data.totalElements || (Array.isArray(data) ? data.length : 0));
      setError(null);
    } catch (err) {
      console.error("Error fetching repairs:", err);
      setError(err.message || "Failed to load repair requests");
      setRepairs([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRepairs();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [fetchRepairs]);

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, query: e.target.value, page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }));
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

  const handleRepairDelete = async () => {
    try {
      await deleteRepairRequest(modalState.selectedRepair.repairId);
      setRepairs(repairs.filter(repair => repair.repairId !== modalState.selectedRepair.repairId));
      closeModal();
    } catch (err) {
      setError(err.message || "Failed to delete repair request");
    }
  };

  const openModal = (type, repair = null) => {
    setModalState({
      showEdit: type === 'edit',
      showDelete: type === 'delete',
      selectedRepair: repair
    });
  };

  const closeModal = () => {
    setModalState({
      showEdit: false,
      showDelete: false,
      selectedRepair: null
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Repair Management</h1>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                value={filters.query}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search repairs..."
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <select
              value={filters.status}
              onChange={handleStatusFilter}
              className="w-full md:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Repairs Table */}
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { label: 'Customer', key: 'userFullName' },
                { label: 'Device', key: 'deviceType' },
                { label: 'Problem', key: 'problemDescription' },
                { label: 'Status', key: 'status' },
                { label: 'Created', key: 'createdAt' },
                { label: 'Completion Date', key: 'actualCompletionDate' },
                { label: 'Cost', key: 'repairCost' },
                { label: 'Actions', key: null }
              ].map((column) => (
                <th 
                  key={column.label}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.key && (
                      <button 
                        onClick={() => handleSort(column.key)}
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
                <td colSpan="8" className="px-4 py-6">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : repairs.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                  No repair requests found
                </td>
              </tr>
            ) : (
              repairs.map((repair) => (
                <tr key={repair.repairId} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {repair.userFullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {repair.userEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{repair.deviceType}</div>
                    <div className="text-sm text-gray-500">{repair.deviceModel}</div>
                    {repair.serialNumber && (
                      <div className="text-xs text-gray-500">SN: {repair.serialNumber}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {repair.problemDescription}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(repair.status)}`}>
                      {repair.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(repair.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(repair.actualCompletionDate)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {repair.repairCost ? `$${repair.repairCost}` : 'Not set'}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => openModal('edit', repair)}
                      className="text-blue-600 hover:text-blue-900"
                      aria-label="Edit repair"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => openModal('delete', repair)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Delete repair"
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
      <RepairEditModal
        isOpen={modalState.showEdit}
        onClose={closeModal}
        repair={modalState.selectedRepair}
        onUpdate={(updatedRepair) => {
          setRepairs(repairs.map(r => 
            r.repairId === updatedRepair.repairId ? updatedRepair : r
          ));
          closeModal();
        }}
      />

      <ConfirmModal
        isOpen={modalState.showDelete}
        onClose={closeModal}
        onConfirm={handleRepairDelete}
        title="Delete Repair Request"
        message={`Are you sure you want to delete the repair request for ${modalState.selectedRepair?.userFullName || 'this customer'}?`}
      />
    </div>
  );
};

// Modal for editing repair details
const RepairEditModal = ({ isOpen, onClose, repair, onUpdate }) => {
  if (!isOpen || !repair) return null;

  const [formData, setFormData] = useState({
    status: repair.status || 'PENDING',
    actualCompletionDate: repair.actualCompletionDate 
      ? new Date(repair.actualCompletionDate).toISOString().split('T')[0] 
      : ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Combine both updates into a single request to avoid race conditions
      const updateData = {
        status: formData.status,
        actualCompletionDate: formData.actualCompletionDate 
          ? new Date(formData.actualCompletionDate + 'T00:00:00').toISOString() 
          : null
      };
      
      console.log('Updating repair with data:', updateData);
      
      // Use full update method that can handle both status and other details
      await updateRepairDetails(repair.repairId, updateData);
      
      // Get the updated repair
      const updatedRepair = await getRepairRequestById(repair.repairId);
      onUpdate(updatedRepair);
      onClose();
    } catch (err) {
      console.error('Error updating repair:', err);
      setError(err.response?.data?.message || err.message || "An error occurred while updating the repair");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Update Repair Status & Completion Date</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Customer Info (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <input
                  type="text"
                  value={repair.userFullName || 'N/A'}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={repair.userEmail || 'N/A'}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              {/* Device Info (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                <input
                  type="text"
                  value={repair.deviceType || 'N/A'}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Model</label>
                <input
                  type="text"
                  value={repair.deviceModel || 'N/A'}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              {/* Status (Editable) */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Actual Completion Date (Editable) */}
              <div>
                <label htmlFor="actualCompletionDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Completion Date
                </label>
                <input
                  type="date"
                  id="actualCompletionDate"
                  name="actualCompletionDate"
                  value={formData.actualCompletionDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Update Repair'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RepairManagement; 