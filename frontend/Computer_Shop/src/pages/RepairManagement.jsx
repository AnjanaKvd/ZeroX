import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  getAllRepairRequests, 
  updateRepairRequest, 
  getRepairRequestById 
} from "../services/repairService";
import { useAuth } from "../context/AuthContext";

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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [editingRepair, setEditingRepair] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  const statuses = [
    "PENDING",
    "DIAGNOSTIC",
    "AWAITING_APPROVAL",
    "PARTS_ORDERED",
    "IN_PROGRESS",
    "TESTING",
    "READY_FOR_PICKUP",
    "COMPLETED",
    "CANCELLED"
  ];

  useEffect(() => {
    fetchRepairs();
  }, [currentPage, selectedStatus]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, size: 10 };
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      const response = await getAllRepairRequests(params);
      setRepairs(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching repairs:", err);
      setError("Failed to load repair requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleEditRepair = async (repairId) => {
    try {
      setLoading(true);
      const repair = await getRepairRequestById(repairId);
      setEditingRepair({
        ...repair,
        estimatedCompletionDate: repair.estimatedCompletionDate ? 
          new Date(repair.estimatedCompletionDate).toISOString().split('T')[0] : 
          '',
      });
    } catch (err) {
      console.error("Error fetching repair details:", err);
      setError("Failed to load repair details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRepair(null);
  };

  const handleUpdateField = (field, value) => {
    setEditingRepair({
      ...editingRepair,
      [field]: value
    });
  };

  const handleSaveRepair = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare update data
      const updateData = {
        status: editingRepair.status,
        technicianNotes: editingRepair.technicianNotes,
        estimatedCost: parseFloat(editingRepair.estimatedCost) || null,
        serviceFee: parseFloat(editingRepair.serviceFee) || null,
        technicianId: user.id, // Using current user as technician
        estimatedCompletionDate: editingRepair.estimatedCompletionDate || null
      };

      await updateRepairRequest(editingRepair.repairId, updateData);
      setEditingRepair(null);
      setSuccessMessage("Repair request updated successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
      
      await fetchRepairs();
    } catch (err) {
      console.error("Error updating repair:", err);
      setError("Failed to update repair request: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (loading && repairs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Repair Management</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={handleStatusChange}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={fetchRepairs}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 self-end"
        >
          Refresh
        </button>
      </div>
      
      {editingRepair ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Repair Request</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <p className="p-2 bg-gray-50 rounded">{editingRepair.customerName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device
              </label>
              <p className="p-2 bg-gray-50 rounded">
                {editingRepair.deviceType} - {editingRepair.deviceBrand} {editingRepair.deviceModel}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Details
              </label>
              <p className="p-2 bg-gray-50 rounded h-24 overflow-y-auto">
                {editingRepair.issueDetails}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                Status *
              </label>
              <select
                id="status"
                value={editingRepair.status}
                onChange={(e) => handleUpdateField('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="estimatedCost">
                Estimated Cost ($)
              </label>
              <input
                type="number"
                id="estimatedCost"
                value={editingRepair.estimatedCost || ''}
                onChange={(e) => handleUpdateField('estimatedCost', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="serviceFee">
                Service Fee ($)
              </label>
              <input
                type="number"
                id="serviceFee"
                value={editingRepair.serviceFee || ''}
                onChange={(e) => handleUpdateField('serviceFee', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="estimatedCompletionDate">
                Estimated Completion Date
              </label>
              <input
                type="date"
                id="estimatedCompletionDate"
                value={editingRepair.estimatedCompletionDate || ''}
                onChange={(e) => handleUpdateField('estimatedCompletionDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="technicianNotes">
                Technician Notes
              </label>
              <textarea
                id="technicianNotes"
                value={editingRepair.technicianNotes || ''}
                onChange={(e) => handleUpdateField('technicianNotes', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                rows="4"
                placeholder="Add notes about the repair process, parts needed, etc."
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelEdit}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRepair}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {repairs.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No repair requests found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {repairs.map((repair) => (
                  <tr key={repair.repairId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {repair.deviceType}
                      </div>
                      <div className="text-sm text-gray-500">
                        {repair.deviceBrand} {repair.deviceModel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{repair.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={repair.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(repair.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditRepair(repair.repairId)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <Link
                        to={`/repair/${repair.repairId}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded ${
              currentPage === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RepairManagement; 