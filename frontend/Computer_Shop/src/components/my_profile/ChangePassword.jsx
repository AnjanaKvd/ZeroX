import React, { useState } from "react";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    previousPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    console.log("Password Change Request:", formData);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
        Change Password
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Previous Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium">
            Enter Previous Password
          </label>
          <input
            name="previousPassword"
            type="password"
            value={formData.previousPassword}
            onChange={handleChange}
            className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
          />
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium">
            Add a New Password
          </label>
          <input
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium">
            Confirm New Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
