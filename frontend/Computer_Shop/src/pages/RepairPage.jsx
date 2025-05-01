import React, { useEffect } from 'react';
import { useRepair } from '../context/RepairContext';

const RepairPage = () => {
  const { repairs, loading, error, fetchRepairsByStatus } = useRepair();

  useEffect(() => {
    console.log('Fetching repairs...');
    fetchRepairsByStatus(); // Fetch all repairs on load
  }, [fetchRepairsByStatus]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Repair Requests</h1>
      {repairs.length === 0 ? (
        <p>No repair requests found.</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Repair ID</th>
              <th className="border border-gray-300 px-4 py-2">Device</th>
              <th className="border border-gray-300 px-4 py-2">Status</th>
              <th className="border border-gray-300 px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((repair) => (
              <tr key={repair.repairId}>
                <td className="border border-gray-300 px-4 py-2">{repair.repairId}</td>
                <td className="border border-gray-300 px-4 py-2">{repair.deviceType}</td>
                <td className="border border-gray-300 px-4 py-2">{repair.status}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(repair.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RepairPage;