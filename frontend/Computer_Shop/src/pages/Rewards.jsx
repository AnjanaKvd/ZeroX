import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getRewardSummary, getDeliveredItems } from "../services/rewardService";

const Rewards = () => {
  const { user } = useContext(AuthContext);
  const [rewardSummary, setRewardSummary] = useState({
    availablePoints: 0,
    totalEarnedPoints: 0,
    loyaltyStatus: "Bronze", // default
  });
  const [deliveredItems, setDeliveredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [summary, delivered] = await Promise.all([
          getRewardSummary(user.userId),
          getDeliveredItems(user.userId),
        ]);

        setRewardSummary(summary);
        setDeliveredItems(delivered);
        setError(null);
      } catch (err) {
        console.error("Error loading rewards data:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.userId) {
      fetchData();
    }
  }, [user?.userId]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">My Rewards</h1>

          {/* Summary Points Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow flex justify-between items-center">
            <p className="text-lg text-gray-700">
              🏅 Earned Points <strong>{rewardSummary.totalPoints}</strong>
            </p>
            <p className="text-lg text-gray-700">
              🎯 Available Points{" "}
              <strong>{rewardSummary.availablePoints}</strong>
            </p>
          </div>

          {/* Loyalty Status Section */}
          <h2 className="text-xl font-semibold mb-2 text-gray-700">
            Loyalty Status
          </h2>

          <div className="my-6">
            <div className="bg-slate-200 grid grid-cols-3 text-center py-4 rounded-t-lg">
              <div className="text-sm font-medium text-red-400">🥉 Bronze</div>
              <div className="text-sm font-medium text-gray-500">🥈 Silver</div>
              <div className="text-sm font-medium text-yellow-600">🥇 Gold</div>
            </div>

            {/* Progress Line with Movable Ball */}
            <div className="relative bg-gray-300 h-2 rounded-b-lg">
              <div
                className="absolute -top-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow"
                style={{
                  left: `${
                    rewardSummary.totalPoints >= 1300 
                      ? 84
                      : rewardSummary.totalPoints >= 500
                      ? 50
                      : 18
                  }%`,
                  transform: "translateX(-50%)",
                  transition: "left 0.3s ease",
                }}
              ></div>
            </div>

            {/* Current Loyalty Status Display */}
            <p className="text-center text-md font-medium text-blue-700 mt-4">
              Current Status:{" "}
              <span className="font-semibold">
                {rewardSummary.loyaltyStatus}
              </span>
            </p>
          </div>


          {/* <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Delivered Items</h2>
            {deliveredItems.length === 0 ? (
              <p className="text-gray-500">No delivered items found.</p>
            ) : (
              <ul className="space-y-3">
                {deliveredItems.map((item) => (
                  <li
                    key={item.id}
                    className="p-3 border rounded-lg bg-white shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {item.productName || "Product"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      Delivered on:{" "}
                      {new Date(item.deliveredAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div> */}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Rewards;
