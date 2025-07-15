import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRepairRequestById } from "../services/repairService";
import { useAuth } from "../context/AuthContext";

const StatusBadge = ({ status }) => {
  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
};

const RepairDetail = () => {
  const { repairId } = useParams();
  const { user } = useAuth();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepairDetails = async () => {
      try {
        setLoading(true);
        const repairData = await getRepairRequestById(repairId);
        setRepair(repairData);
      } catch (err) {
        setError("Failed to load repair details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (repairId) {
      fetchRepairDetails();
    }
  }, [repairId]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );
  
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  
  if (!repair) return <div className="text-center p-4">Repair request not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link to="/repair-history" className="text-blue-600 hover:underline">&larr; Back to Repair History</Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Repair Request #{repair.repairId.substring(0, 8)}</h1>
            <StatusBadge status={repair.status} />
          </div>
          
          <div className="text-sm text-gray-500 mb-2">
            Submitted on {new Date(repair.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Device Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Type:</span> {repair.deviceType}</p>
              <p><span className="font-medium">Model:</span> {repair.deviceModel}</p>
              <p><span className="font-medium">Serial Number:</span> {repair.serialNumber}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Repair Details</h2>
            <div className="space-y-2">
              {repair.technicianName && (
                <p><span className="font-medium">Technician:</span> {repair.technicianName}</p>
              )}
              {repair.estimatedCompletionDate && (
                <p><span className="font-medium">Estimated Completion:</span> {new Date(repair.estimatedCompletionDate).toLocaleDateString()}</p>
              )}
              {repair.repairCost != null && (
                <p><span className="font-medium">Repair Cost:</span> ${repair.repairCost.toFixed(2)}</p>
              )}
              <p><span className="font-medium">Payment Status:</span> {repair.isPaid ? "Paid" : "Unpaid"}</p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Problem Description</h2>
            <p className="bg-gray-50 p-4 rounded">{repair.problemDescription}</p>
          </div>
          
          {repair.additionalNotes && (
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
              <p className="bg-gray-50 p-4 rounded">{repair.additionalNotes}</p>
            </div>
          )}
          
          {repair.diagnosticNotes && (
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Technician Notes</h2>
              <p className="bg-gray-50 p-4 rounded">{repair.diagnosticNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairDetail; 