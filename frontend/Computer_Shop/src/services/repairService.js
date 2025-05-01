// import api from './api';


// export const getRepairRequests = async (userId = null) => {  
//     const endpoint = userId ? `/repairs/user/${userId}` : '/repairs'; 
//     const response = await api.get(endpoint);  
//      return response.data;
//     };
     
// export const updateRepairRequest = async (repairId, updateData) => { 
//         const response = await api.put(`/repairs/${repairId}`, updateData); 
//          return response.data;
//     };

// // export const createRepairRequest = async (repairData) => {
// //   try {
// //     const response = await api.post("/api/repairs", repairData); // Ensure this endpoint is correct
// //     return response.data;
// //   } catch (error) {
// //     console.error("Error creating repair request:", error);
// //     throw error; // Ensure the error is properly logged
// //   }
// // };
// export const createRepairRequest = async (repairData) => {
//     try {
//       const response = await api.post("/repairs", repairData, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
//         }
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Error creating repair request:", error);
//       throw error;
//     }
//   };
import api from "./api"; // Assuming you have an API utility for making HTTP requests

/**
 * Create a new repair request.
 * @param {Object} repairData - The repair request data.
 * @returns {Promise<Object>} - The created repair request response.
 */
export const createRepairRequest = async (repairData) => {
  try {
    const response = await api.post("/repairs", repairData); // Backend endpoint for creating repair requests
    return response.data;
  } catch (error) {
    console.error("Error creating repair request:", error);
    throw error; // Rethrow the error to be handled in the frontend
  }
};

/**
 * Get all repair requests for the logged-in user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - List of repair requests for the user.
 */
export const getUserRepairRequests = async (userId) => {
  try {
    const response = await api.get(`/repairs/user/${userId}`); // Backend endpoint for fetching user-specific repair requests
    return response.data;
  } catch (error) {
    console.error("Error fetching user repair requests:", error);
    throw error;
  }
};

/**
 * Get all repair requests (for admins or technicians).
 * @param {Object} params - Pagination parameters (e.g., page, size).
 * @returns {Promise<Object>} - Paginated list of all repair requests.
 */
export const getAllRepairRequests = async (params = { page: 0, size: 10 }) => {
  try {
    const response = await api.get("/repairs", { params }); // Backend endpoint for fetching all repair requests
    return response.data;
  } catch (error) {
    console.error("Error fetching all repair requests:", error);
    throw error;
  }
};

/**
 * Update a repair request (for admins or technicians).
 * @param {string} repairId - The ID of the repair request to update.
 * @param {Object} updateData - The data to update the repair request.
 * @returns {Promise<Object>} - The updated repair request response.
 */
export const updateRepairRequest = async (repairId, updateData) => {
  try {
    const response = await api.put(`/repairs/${repairId}`, updateData); // Backend endpoint for updating repair requests
    return response.data;
  } catch (error) {
    console.error("Error updating repair request:", error);
    throw error;
  }
};

/**
 * Get a specific repair request by ID.
 * @param {string} repairId - The ID of the repair request.
 * @returns {Promise<Object>} - The repair request details.
 */
export const getRepairRequestById = async (repairId) => {
  try {
    const response = await api.get(`/repairs/${repairId}`); // Backend endpoint for fetching a specific repair request
    return response.data;
  } catch (error) {
    console.error("Error fetching repair request by ID:", error);
    throw error;
  }
};