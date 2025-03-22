import React, { useState } from "react";
import EditProfile from "../components/my_profile/EditProfile";
import "../index.css";
import ChangePassword from "../components/my_profile/ChangePassword";

const MyProfile = () => {
  const [selectedTab, setSelectedTab] = useState("edit");

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar Navigation */}
        <div className="w-1/4 bg-white shadow-lg p-4">
          <h2 className="text-xl font-bold mb-4">My Profile</h2>
          <button
            onClick={() => setSelectedTab("edit")}
            className={`w-full text-left p-2 rounded ${
              selectedTab === "edit" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setSelectedTab("orders")}
            className={`w-full text-left p-2 rounded ${
              selectedTab === "orders"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => setSelectedTab("rewards")}
            className={`w-full text-left p-2 rounded ${
              selectedTab === "rewards"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Reward Points
          </button>
          <button
            onClick={() => setSelectedTab("reviews")}
            className={`w-full text-left p-2 rounded ${
              selectedTab === "reviews"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            My Reviews
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {selectedTab === "edit" && <EditProfile />}
          {selectedTab === "orders" && <p>Orders Section</p>}
          {selectedTab === "rewards" && <p>Rewards Section</p>}
          {selectedTab === "reviews" && <p>Reviews Section</p>}
        </div>

        <ChangePassword />
      </div>
    </>
  );
};

export default MyProfile;
