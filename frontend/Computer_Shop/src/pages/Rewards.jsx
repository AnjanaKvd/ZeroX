import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getUserRewards,
  claimRewards,
  processUserOrders
} from "../services/rewardService";

const Rewards = () => {
  const { user } = useContext(AuthContext);
  const [rewardsData, setRewardsData] = useState({
    totalPoints: 0,
    availablePoints: 0,
    claimedPoints: 0,
    currentTier: "BRONZE",
    currentPointsRate: 0.01,
    pointsToNextTier: 0,
    recentRewards: []
  });
  const [selectedRewards, setSelectedRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchUserRewards = async () => {
    if (!user?.userId) return;
    
    try {
      setIsLoading(true);
      const data = await getUserRewards(user.userId);
      setRewardsData(data);
      setError(null);
    } catch (err) {
      console.error("Error loading rewards data:", err);
      setError(err.message || "Something went wrong while fetching rewards.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRewards();
  }, [user]);

  const handleProcessOrders = async () => {
    if (!user?.userId) return;
    
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      await processUserOrders(user.userId);
      await fetchUserRewards(); // Refresh data
      setSuccessMessage("Orders processed and new reward points generated!");
    } catch (error) {
      console.error("Failed to process orders:", error);
      setError(error.message || "Failed to process orders");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleReward = (rewardId) => {
    setSelectedRewards(prev => {
      if (prev.includes(rewardId)) {
        return prev.filter(id => id !== rewardId);
      } else {
        return [...prev, rewardId];
      }
    });
  };

  const handleClaimSelectedRewards = async () => {
    if (!user?.userId || selectedRewards.length === 0) return;
    
    try {
      setIsClaiming(true);
      setSuccessMessage(null);
      const result = await claimRewards(user.userId, selectedRewards);
      await fetchUserRewards(); // Refresh data
      setSelectedRewards([]);
      setSuccessMessage(`Successfully claimed ${result.pointsClaimed} points!`);
    } catch (error) {
      console.error("Failed to claim rewards:", error);
      setError(error.message || "Failed to claim rewards");
    } finally {
      setIsClaiming(false);
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Tier color mapping
  const tierColors = {
    BRONZE: "text-amber-700",
    SILVER: "text-slate-600",
    GOLD: "text-yellow-600",
    PLATINUM: "text-purple-600"
  };

  // Progress calculation for tier progress bar
  const calculateTierProgress = () => {
    const tierRanges = {
      BRONZE: { min: 0, max: 999 },
      SILVER: { min: 1000, max: 4999 },
      GOLD: { min: 5000, max: 9999 },
      PLATINUM: { min: 10000, max: 10000 } // No max for Platinum
    };
    
    const currentTier = rewardsData.currentTier;
    
    if (currentTier === "PLATINUM") return 100;
    
    const range = tierRanges[currentTier];
    const tierMin = range.min;
    const tierMax = range.max;
    const totalInTier = tierMax - tierMin;
    const pointsInTier = rewardsData.totalPoints - tierMin;
    
    return Math.min(Math.round((pointsInTier / totalInTier) * 100), 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">My Rewards</h1>
          
          {/* Points Summary Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h2 className="text-sm text-gray-500">Total Points</h2>
                <p className="text-3xl font-bold text-gray-800">{rewardsData.totalPoints}</p>
              </div>
              
              <div className="text-center">
                <h2 className="text-sm text-gray-500">Available Points</h2>
                <p className="text-3xl font-bold text-blue-600">{rewardsData.availablePoints}</p>
              </div>
              
              <div className="text-center">
                <h2 className="text-sm text-gray-500">Claimed Points</h2>
                <p className="text-3xl font-bold text-green-600">{rewardsData.claimedPoints}</p>
              </div>
            </div>
          </div>
          
          {/* Loyalty Tier Section */}
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Loyalty Status</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Current Tier</p>
                <p className={`text-2xl font-bold ${tierColors[rewardsData.currentTier]}`}>
                  {rewardsData.currentTier}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Points Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(rewardsData.currentPointsRate * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Points to Next Tier</p>
                <p className="text-2xl font-bold text-purple-600">
                  {rewardsData.pointsToNextTier}
                </p>
              </div>
            </div>
            
            {/* Tier Progress Bar */}
            <div className="mt-6 mb-2">
              <div className="bg-slate-200 grid grid-cols-4 text-center py-3 rounded-lg">
                <div className={`text-sm font-medium ${rewardsData.currentTier === 'BRONZE' ? 'text-amber-700 font-bold' : 'text-gray-500'}`}>
                  🥉 Bronze
                </div>
                <div className={`text-sm font-medium ${rewardsData.currentTier === 'SILVER' ? 'text-slate-600 font-bold' : 'text-gray-500'}`}>
                  🥈 Silver
                </div>
                <div className={`text-sm font-medium ${rewardsData.currentTier === 'GOLD' ? 'text-yellow-600 font-bold' : 'text-gray-500'}`}>
                  🥇 Gold
                </div>
                <div className={`text-sm font-medium ${rewardsData.currentTier === 'PLATINUM' ? 'text-purple-600 font-bold' : 'text-gray-500'}`}>
                  💎 Platinum
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-in-out"
                style={{ width: `${calculateTierProgress()}%` }}
              ></div>
            </div>
            
            {/* Tier Benefits */}
            <div className="mt-6 text-sm text-gray-600">
              <h3 className="font-semibold mb-2">Loyalty Tier Benefits:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-amber-700 font-semibold">Bronze (0-999 points)</p>
                  <p>• 1% earning rate</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-slate-600 font-semibold">Silver (1,000-4,999 points)</p>
                  <p>• 2% earning rate</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-yellow-600 font-semibold">Gold (5,000-9,999 points)</p>
                  <p>• 3% earning rate</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-purple-600 font-semibold">Platinum (10,000+ points)</p>
                  <p>• 5% earning rate</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Rewards Section */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-700">Recent Rewards</h2>
            <div>
              <button
                onClick={handleProcessOrders}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Process Orders'}
              </button>
              {selectedRewards.length > 0 && (
                <button
                  onClick={handleClaimSelectedRewards}
                  disabled={isClaiming}
                  className="ml-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClaiming ? 'Claiming...' : `Claim Selected (${selectedRewards.length})`}
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
            {rewardsData.recentRewards.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No recent rewards found. Process your orders to generate reward points!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rewardsData.recentRewards.map((reward) => (
                      <tr key={reward.rewardId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {!reward.claimed && (
                            <input 
                              type="checkbox" 
                              checked={selectedRewards.includes(reward.rewardId)}
                              onChange={() => handleToggleReward(reward.rewardId)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reward.orderId.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {reward.pointsEarned}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reward.claimed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reward.claimed ? 'Claimed' : 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(reward.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(reward.expirationDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-6">
              {successMessage}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-6">
              {error}
            </div>
          )}
          
          {/* How Points Work Section */}
          <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-700">How Points Work</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
            <div className="space-y-3 text-gray-600">
              <p>• Points are automatically generated when orders reach DELIVERED status</p>
              <p>• Points expire after 12 months</p>
              <p>• Points can only be claimed once</p>
              <p>• Order amount after discounts determines point calculations</p>
              <p>• You can move between loyalty tiers as you accumulate points</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Rewards;
