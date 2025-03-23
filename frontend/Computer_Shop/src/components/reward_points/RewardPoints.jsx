import React from "react";

const RewardPoints = ({ customer }) => {
  const { name, email, loyaltyStatus, rewards } = customer;

  // Loyalty status badge color based on tier
  const getBadgeColor = (status) => {
    switch (status) {
      case "Explorer":
        return "bg-gray-500";
      case "Adventurer":
        return "bg-blue-500";
      case "Master":
        return "bg-purple-500";
      case "VIP":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
      <div className="p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {name}
            </div>
            <p className="mt-2 text-gray-500">{email}</p>
          </div>
          <div
            className={`${getBadgeColor(
              loyaltyStatus
            )} text-white text-xs font-semibold px-3 py-1 rounded-full`}
          >
            {loyaltyStatus}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">Reward Points</h3>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Main Points</span>
              <span className="font-medium">{rewards.mainPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bonus Points</span>
              <span className="font-medium">{rewards.bonusPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Extra Points</span>
              <span className="font-medium">{rewards.extraPoints}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-800 font-semibold">Total Points</span>
              <span className="text-indigo-600 font-bold">
                {rewards.totalPoints}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardPoints;
