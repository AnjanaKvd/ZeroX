import React, { useState, useEffect } from "react";
import axios from "axios";

const EditProfile = () => {
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/auth/myprofile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFormData({
          fullName: response.data.fullName,
          email: response.data.email,
          contactNumber: response.data.phone || "",
        });
      } catch (err) {
        setError("Failed to fetch profile data");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:8080/api/auth/myprofile",
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.contactNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Profile updated successfully!");
      // Optionally refresh the profile data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error("Update error:", err);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading profile...</div>;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
        Edit Profile
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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

// 1
// 1
// 1
// 1
// 1
// 1
// 1

// import React, { useState } from "react";

// const EditProfile = () => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     contactNumber: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const onSubmit = (e) => {
//     e.preventDefault();
//     console.log("Updated Profile:", formData);
//   };

//   return (
//     <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto mt-6">
//       <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
//         Edit Profile
//       </h2>
//       <form onSubmit={onSubmit}>
//         {/* Full Name */}

//         <div>
//           <label className="block text-sm font-medium">Full Name</label>
//           <input
//             name="fullName"
//             type="text"
//             value={formData.fullName}
//             onChange={handleChange}
//             className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
//           />
//         </div>

//         {/* Email */}
//         <div className="mt-3">
//           <label className="block text-sm font-medium">E-mail</label>
//           <input
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
//           />
//         </div>

//         {/* Contact Number */}
//         <div className="mt-3">
//           <label className="block text-sm font-medium">Contact Number</label>
//           <input
//             name="contactNumber"
//             type="text"
//             value={formData.contactNumber}
//             onChange={handleChange}
//             className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
//           />
//         </div>

//         {/* Save Button */}
//         <button
//           type="submit"
//           className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md"
//         >
//           Save Changes
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EditProfile;
