import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  getRewardSummary,
  claimRewards
} from "../services/rewardService";

const Rewards = () => {
  const { user } = useContext(AuthContext);
  const [rewardSummary, setRewardSummary] = useState({
    totalPoints: 0,
    availablePoints: 0,
    loyaltyStatus: "Bronze",
    unclaimedPoints: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState(null);

  const fetchRewardSummary = async () => {
    try {
      setIsLoading(true);
      const summary = await getRewardSummary();
      setRewardSummary(summary);
      setError(null);
    } catch (err) {
      console.error("Error loading rewards data:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRewardSummary();
    }
  }, [user]);

  const handleClaimRewards = async () => {
    try {
      setIsClaiming(true);
      await claimRewards();
      await fetchRewardSummary(); // Refresh data after claiming
      setIsClaiming(false);
    } catch (error) {
      console.error("Failed to claim rewards:", error);
      setError(error.message || "Failed to claim rewards");
      setIsClaiming(false);
    }
  };

  // Status color mapping
  const statusColor = {
    Bronze: "text-amber-700",
    Silver: "text-slate-500",
    Gold: "text-yellow-500"
  };

  // Status progress mapping (in percentage)
  const statusProgress = {
    Bronze: 10,
    Silver: 50,
    Gold: 90
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
          
          {/* Summary Points Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div className="text-center md:text-left">
                <h2 className="text-sm text-gray-500">Total Points</h2>
                <p className="text-3xl font-bold text-gray-800">{rewardSummary.totalPoints}</p>
              </div>
              
              <div className="text-center">
                <h2 className="text-sm text-gray-500">Available Points</h2>
                <p className="text-3xl font-bold text-blue-600">{rewardSummary.availablePoints}</p>
                <p className="text-xs text-gray-400">1 point = 5 LKR</p>
              </div>
              
              <div className="text-center md:text-right">
                <h2 className="text-sm text-gray-500">Unclaimed Points</h2>
                <p className="text-3xl font-bold text-green-600">{rewardSummary.unclaimedPoints}</p>
                {rewardSummary.unclaimedPoints > 0 && (
                  <button
                    onClick={handleClaimRewards}
                    disabled={isClaiming}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isClaiming ? 'Claiming...' : 'Claim Points'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Loyalty Status Section */}
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Loyalty Status</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-semibold">Current Status:</p>
              <p className={`text-lg font-bold ${statusColor[rewardSummary.loyaltyStatus]}`}>
                {rewardSummary.loyaltyStatus}
              </p>
            </div>
            
            <div className="mb-4">
              <div className="bg-slate-200 grid grid-cols-3 text-center py-3 rounded-lg">
                <div className={`text-sm font-medium ${rewardSummary.loyaltyStatus === 'Bronze' ? 'text-amber-700 font-bold' : 'text-gray-500'}`}>
                  🥉 Bronze
                </div>
                <div className={`text-sm font-medium ${rewardSummary.loyaltyStatus === 'Silver' ? 'text-slate-500 font-bold' : 'text-gray-500'}`}>
                  🥈 Silver
                </div>
                <div className={`text-sm font-medium ${rewardSummary.loyaltyStatus === 'Gold' ? 'text-yellow-500 font-bold' : 'text-gray-500'}`}>
                  🥇 Gold
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-in-out"
                style={{ width: `${statusProgress[rewardSummary.loyaltyStatus]}%` }}
              ></div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <h3 className="font-semibold mb-2">Status Benefits:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Bronze: Default status</li>
                <li>Silver: Earned at 250,000+ LKR yearly spend, includes 300 bonus points</li>
                <li>Gold: Earned at 500,000+ LKR yearly spend, includes 750 bonus points</li>
              </ul>
            </div>
          </div>
          
          {/* How Points Work Section */}
          <h2 className="text-xl font-semibold mb-2 text-gray-700">How Points Work</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
            <div className="space-y-3 text-gray-600">
              <p>• 1 point is awarded per 500 LKR spent on delivered orders</p>
              <p>• Points are generated when orders reach DELIVERED status</p>
              <p>• Points must be claimed to be added to your available balance</p>
              <p>• Each point is worth 5 LKR when redeemed</p>
              <p>• Your loyalty status is calculated based on yearly spending</p>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-6">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Rewards;
