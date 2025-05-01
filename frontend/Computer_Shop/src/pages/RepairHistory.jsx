import { useEffect, useState } from "react";
import { getUserRepairRequests } from "../services/repairService";

const RepairHistory = ({ userId }) => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const data = await getUserRepairRequests(userId);
        setRepairs(data);
      } catch (err) {
        console.error("Error fetching repair history:", err);
        setError("Failed to fetch repair history.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1>Repair History</h1>
      <ul>
        {repairs.map((repair) => (
          <li key={repair.repairId}>
            {repair.deviceType} - {repair.deviceBrand} ({repair.status})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RepairHistory;