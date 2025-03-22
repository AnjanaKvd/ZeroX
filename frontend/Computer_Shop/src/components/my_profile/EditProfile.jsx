import React, { useState } from "react";

// Sri Lanka Provinces & Districts
const provinces = {
  Western: ["Colombo", "Gampaha", "Kalutara"],
  Central: ["Kandy", "Matale", "Nuwara Eliya"],
  Southern: ["Galle", "Matara", "Hambantota"],
  Northern: ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  Eastern: ["Trincomalee", "Batticaloa", "Ampara"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  Uva: ["Badulla", "Monaragala"],
  Sabaragamuwa: ["Ratnapura", "Kegalle"],
};

const EditProfile = () => {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    province: "",
    district: "",
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
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
        Edit Profile
      </h2>
      <form onSubmit={onSubmit}>
        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
            />
          </div>
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

        {/* Address */}
        <div className="mt-3">
          <label className="block text-sm font-medium">Address</label>
          <input
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
          />
        </div>

        {/* Province & District */}
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-sm font-medium">Province</label>
            <select
              name="province"
              value={formData.province}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setFormData({
                  ...formData,
                  province: e.target.value,
                  district: "",
                });
              }}
              className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
            >
              <option value="" disabled>
                -- Select Province --
              </option>
              {Object.keys(provinces).map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
              disabled={!selectedProvince}
            >
              <option value="" disabled>
                -- Select District --
              </option>
              {selectedProvince &&
                provinces[selectedProvince].map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
            </select>
          </div>
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
