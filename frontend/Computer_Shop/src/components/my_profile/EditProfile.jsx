import React, { useState } from "react";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Profile:", formData);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
        Edit Profile
      </h2>
      <form onSubmit={onSubmit}>
        {/* Full Name */}

        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
          />
        </div>

        {/* Email */}
        <div className="mt-3">
          <label className="block text-sm font-medium">E-mail</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
          />
        </div>

        {/* Contact Number */}
        <div className="mt-3">
          <label className="block text-sm font-medium">Contact Number</label>
          <input
            name="contactNumber"
            type="text"
            value={formData.contactNumber}
            onChange={handleChange}
            className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
