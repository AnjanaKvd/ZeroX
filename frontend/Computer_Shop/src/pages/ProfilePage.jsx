import React, { useState } from "react";
import EditProfile from "../components/my_profile/EditProfile";
import ChangePassword from "../components/my_profile/ChangePassword";
import RewardPoints from "../components/reward_points/RewardPoints";
import "../index.css";

const ProfilePage = () => {
  const [selectedTab, setSelectedTab] = useState("edit");
  
  // Sample customer data for RewardPoints component
  const customerData = {
    name: "John Doe",
    email: "john.doe@example.com",
    loyaltyStatus: "Adventurer",
    rewards: {
      mainPoints: 1200,
      bonusPoints: 350,
      extraPoints: 75,
      totalPoints: 1625
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar Navigation */}
        <div className="w-1/4 bg-white shadow-lg p-4">
          <h2 className="text-xl font-bold mb-4">My Profile</h2>
          <button
            onClick={() => setSelectedTab("edit")}
            className={`w-full text-left p-2 rounded mb-2 ${
              selectedTab === "edit" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setSelectedTab("password")}
            className={`w-full text-left p-2 rounded mb-2 ${
              selectedTab === "password" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Change Password
          </button>
          <button
            onClick={() => setSelectedTab("rewards")}
            className={`w-full text-left p-2 rounded mb-2 ${
              selectedTab === "rewards" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Reward Points
          </button>
          <button
            onClick={() => setSelectedTab("orders")}
            className={`w-full text-left p-2 rounded mb-2 ${
              selectedTab === "orders" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => setSelectedTab("reviews")}
            className={`w-full text-left p-2 rounded ${
              selectedTab === "reviews" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            My Reviews
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {selectedTab === "edit" && (
            <div>
              <EditProfile />
            </div>
          )}
          {selectedTab === "password" && (
            <div>
              <ChangePassword />
            </div>
          )}
          {selectedTab === "rewards" && (
            <div>
              <RewardPoints customer={customerData} />
            </div>
          )}
          {selectedTab === "orders" && <p>Orders Section (Coming Soon)</p>}
          {selectedTab === "reviews" && <p>Reviews Section (Coming Soon)</p>}
        </div>
      </div>
    </>
  );
};

export default ProfilePage; 