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
      deviceModel: '',
      serialNumber: '',
      problemDescription: '',
      additionalNotes: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      if (!user) {
        throw new Error("You must be logged in to submit a repair request");
      }

      // Prepare request data with new format
      const requestData = {
        deviceType: data.deviceType,
        deviceModel: data.deviceModel.trim(),
        serialNumber: data.serialNumber.trim(),
        problemDescription: data.problemDescription.trim(),
        additionalNotes: data.additionalNotes.trim() || null
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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Submit Repair Request</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <p>Repair request submitted successfully! Redirecting to repair history...</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="deviceType" className="block text-gray-700 font-medium mb-2">
            Device Type *
          </label>
          <input
            type="text"
            id="deviceType"
            {...register("deviceType", { required: "Device type is required" })}
            className={`w-full border ${errors.deviceType ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
            placeholder="Laptop, Desktop, Tablet, etc."
          />
          {errors.deviceType && (
            <p className="text-red-500 text-sm mt-1">{errors.deviceType.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="deviceModel" className="block text-gray-700 font-medium mb-2">
            Device Model *
          </label>
          <input
            type="text"
            id="deviceModel"
            {...register("deviceModel", { required: "Device model is required" })}
            className={`w-full border ${errors.deviceModel ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
            placeholder="e.g., Dell XPS 15, HP Pavilion, etc."
          />
          {errors.deviceModel && (
            <p className="text-red-500 text-sm mt-1">{errors.deviceModel.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="serialNumber" className="block text-gray-700 font-medium mb-2">
            Serial Number *
          </label>
          <input
            type="text"
            id="serialNumber"
            {...register("serialNumber", { required: "Serial number is required" })}
            className={`w-full border ${errors.serialNumber ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
            placeholder="Device serial number"
          />
          {errors.serialNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.serialNumber.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="problemDescription" className="block text-gray-700 font-medium mb-2">
            Problem Description *
          </label>
          <textarea
            id="problemDescription"
            {...register("problemDescription", { 
              required: "Problem description is required",
              minLength: {
                value: 10,
                message: "Please provide more details (at least 10 characters)"
              }
            })}
            className={`w-full border ${errors.problemDescription ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
            rows="4"
            placeholder="Describe the issue in detail..."
          ></textarea>
          {errors.problemDescription && (
            <p className="text-red-500 text-sm mt-1">{errors.problemDescription.message}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="additionalNotes" className="block text-gray-700 font-medium mb-2">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            {...register("additionalNotes")}
            className="w-full border border-gray-300 rounded-md p-2"
            rows="3"
            placeholder="Any additional information that might help the technician..."
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors ${
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
    </div>
  );
};

export default Repair;