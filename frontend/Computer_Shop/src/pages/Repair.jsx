// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { createRepairRequest } from "../services/repairService";
// import Header from "../components/common/Header/Header";
// import Footer from "../components/common/Footer/Footer";
// import { useAuth } from "../context/AuthContext";

// const Repair = () => {
//   const { register, handleSubmit } = useForm();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const onSubmit = async (data) => {
//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       if (!user) {
//         throw new Error("You must be logged in to submit a repair request");
//       }

//       const requestData = {
//         userId: user.id,
//         deviceType: data.deviceType || "UNKNOWN", // Provide default values if necessary
//         deviceBrand: data.deviceBrand || "UNKNOWN",
//         deviceModel: data.deviceModel || "UNKNOWN",
//         issueDetails: data.issueDetails || "No details provided",
//       };

//       console.log("Submitting repair request payload:", requestData); // Log the payload
//       await createRepairRequest(requestData);

//       setSuccess(true);
//       setTimeout(() => {
//         navigate("/repair-history");
//       }, 1500);
//     } catch (err) {
//       console.error("Error submitting repair request:", err.response?.data || err.message);
//       setError(err.response?.data?.message || "Failed to submit repair request. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header />
//       <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
//         <h1 className="text-3xl font-bold mb-6">Submit a Repair Request</h1>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//             {error}
//           </div>
//         )}

//         {success && (
//           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
//             Repair request submitted successfully! Redirecting...
//           </div>
//         )}

//         <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md">
//           <div className="mb-4">
//             <label htmlFor="deviceType" className="block text-gray-700 font-medium mb-2">
//               Device Type
//             </label>
//             <select
//               id="deviceType"
//               {...register("deviceType")}
//               className="w-full border border-gray-300 rounded-md p-3"
//               defaultValue=""
//             >
//               <option value="" disabled>Select a device type</option>
//               <option value="DESKTOP">Desktop</option>
//               <option value="LAPTOP">Laptop</option>
//               <option value="TABLET">Tablet</option>
//               <option value="KEYBOARD">Keyboard</option>
//               <option value="MOUSE">Mouse</option>
//               <option value="MONITOR">Monitor</option>
//               <option value="OTHER">Other</option>
//             </select>
//           </div>

//           <div className="mb-4">
//             <label htmlFor="deviceBrand" className="block text-gray-700 font-medium mb-2">
//               Device Brand
//             </label>
//             <input
//               type="text"
//               id="deviceBrand"
//               {...register("deviceBrand")}
//               className="w-full border border-gray-300 rounded-md p-3"
//               placeholder="e.g., Dell, Apple, HP"
//             />
//           </div>

//           <div className="mb-4">
//             <label htmlFor="deviceModel" className="block text-gray-700 font-medium mb-2">
//               Device Model
//             </label>
//             <input
//               type="text"
//               id="deviceModel"
//               {...register("deviceModel")}
//               className="w-full border border-gray-300 rounded-md p-3"
//               placeholder="e.g., XPS 13, MacBook Pro"
//             />
//           </div>

//           <div className="mb-6">
//             <label htmlFor="issueDetails" className="block text-gray-700 font-medium mb-2">
//               Issue Details
//             </label>
//             <textarea
//               id="issueDetails"
//               {...register("issueDetails")}
//               className="w-full border border-gray-300 rounded-md p-3"
//               rows="5"
//               placeholder="Describe the problem in detail..."
//             ></textarea>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors ${
//               loading ? "opacity-70 cursor-not-allowed" : ""
//             }`}
//           >
//             {loading ? (
//               <span className="flex items-center justify-center">
//                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing...
//               </span>
//             ) : "Submit Request"}
//           </button>
//         </form>
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default Repair;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createRepairRequest } from "../services/repairService";
import { useAuth } from "../context/AuthContext";

const Repair = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onBlur',
    defaultValues: {
      deviceType: '',
      deviceBrand: '',
      deviceModel: '',
      issueDetails: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!user) {
        throw new Error("You must be logged in to submit a repair request");
      }

      const requestData = {
        userId: user.id,
        deviceType: data.deviceType,
        deviceBrand: data.deviceBrand.trim(),
        deviceModel: data.deviceModel.trim(),
        issueDetails: data.issueDetails.trim()
      };

      console.log("Submitting repair request payload:", requestData);
      await createRepairRequest(requestData);

      setSuccess(true);
      setTimeout(() => navigate("/repair-history"), 1500);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit repair request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Submit a Repair Request</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            Repair request submitted successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="deviceType" className="block text-gray-700 font-medium mb-2">
              Device Type *
            </label>
            <select
              id="deviceType"
              {...register("deviceType", { 
                required: "Device type is required",
                validate: value => value !== "" || "Please select a device type"
              })}
              className={`w-full border ${errors.deviceType ? "border-red-500" : "border-gray-300"} rounded-md p-3`}
            >
              <option value="" disabled>Select a device type</option>
              <option value="DESKTOP">Desktop</option>
              <option value="LAPTOP">Laptop</option>
              <option value="TABLET">Tablet</option>
              <option value="KEYBOARD">Keyboard</option>
              <option value="MOUSE">Mouse</option>
              <option value="MONITOR">Monitor</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.deviceType && (
              <p className="text-red-500 text-sm mt-1">{errors.deviceType.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="deviceBrand" className="block text-gray-700 font-medium mb-2">
              Device Brand *
            </label>
            <input
              type="text"
              id="deviceBrand"
              {...register("deviceBrand", { 
                required: "Device brand is required",
                minLength: {
                  value: 2,
                  message: "Brand must be at least 2 characters"
                }
              })}
              className={`w-full border ${errors.deviceBrand ? "border-red-500" : "border-gray-300"} rounded-md p-3`}
              placeholder="e.g., Dell, Apple, HP"
            />
            {errors.deviceBrand && (
              <p className="text-red-500 text-sm mt-1">{errors.deviceBrand.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="deviceModel" className="block text-gray-700 font-medium mb-2">
              Device Model *
            </label>
            <input
              type="text"
              id="deviceModel"
              {...register("deviceModel", { 
                required: "Device model is required",
                minLength: {
                  value: 2,
                  message: "Model must be at least 2 characters"
                }
              })}
              className={`w-full border ${errors.deviceModel ? "border-red-500" : "border-gray-300"} rounded-md p-3`}
              placeholder="e.g., XPS 13, MacBook Pro"
            />
            {errors.deviceModel && (
              <p className="text-red-500 text-sm mt-1">{errors.deviceModel.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="issueDetails" className="block text-gray-700 font-medium mb-2">
              Issue Details *
            </label>
            <textarea
              id="issueDetails"
              {...register("issueDetails", { 
                required: "Issue details are required",
                minLength: {
                  value: 10,
                  message: "Please provide more details (at least 10 characters)"
                }
              })}
              className={`w-full border ${errors.issueDetails ? "border-red-500" : "border-gray-300"} rounded-md p-3`}
              rows="5"
              placeholder="Describe the problem in detail..."
            ></textarea>
            {errors.issueDetails && (
              <p className="text-red-500 text-sm mt-1">{errors.issueDetails.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Submit Request"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Repair;