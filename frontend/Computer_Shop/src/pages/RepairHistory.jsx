import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserRepairRequests } from "../services/repairService";
import { useAuth } from "../context/AuthContext";

const StatusBadge = ({ status }) => {
  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800"
  };
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
};

const RepairHistory = () => {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        if (!user) {
          setError("You must be logged in to view repair history");
          setLoading(false);
          return;
        }
        
        const data = await getUserRepairRequests();
        setRepairs(data);
      } catch (err) {
        setError("Failed to fetch repair history.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, [user]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );
  
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Repair Requests</h1>
        <Link 
          to="/repair" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Submit New Request
        </Link>
      </div>

      {repairs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-medium text-gray-600">No repair requests found</h2>
          <p className="text-gray-500 mt-2">You haven't submitted any repair requests yet.</p>
          <Link 
            to="/repair" 
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Submit Your First Request
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {repairs.map((repair) => (
              <li key={repair.repairId}>
                <Link to={`/repair/${repair.repairId}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {repair.deviceType} - {repair.deviceModel}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <StatusBadge status={repair.status} />
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <span>Issue: {repair.problemDescription.substring(0, 100)}{repair.problemDescription.length > 100 ? '...' : ''}</span>
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p>
                          Submitted: {new Date(repair.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RepairHistory;