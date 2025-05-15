import api from "./api"; // Assuming you have an API utility for making HTTP requests

/**
 * Create a new repair request.
 * @param {Object} repairData - The repair request data.
 * @returns {Promise<Object>} - The created repair request response.
 */
export const createRepairRequest = async (repairData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const response = await api.post("/repairs", repairData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating repair request:", error);
    throw error;
  }
};

/**
 * Get all repair requests for the logged-in user.
 * @returns {Promise<Array>} - List of repair requests for the user.
 */
export const getUserRepairRequests = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const response = await api.get("/repairs/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user repair requests:", error);
    throw error;
  }
};

/**
 * Get all repair requests (for admins or technicians).
 * @param {Object} filters - Optional filters for the API request (status, query, page, etc.).
 * @returns {Promise<Array>} - List of all repair requests.
 */
export const getAllRepairRequests = async (filters = {}) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const queryParams = new URLSearchParams();
    
    // Add each filter to query parameters
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.query) queryParams.append('query', filters.query);
    if (filters.page) queryParams.append('page', filters.page - 1); // Backend pagination often starts at 0
    if (filters.pageSize) queryParams.append('size', filters.pageSize);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortDirection) queryParams.append('sortDir', filters.sortDirection);

    const queryString = queryParams.toString();
    const url = queryString ? `/repairs?${queryString}` : '/repairs';

    console.log('API request URL:', url); // Debugging

    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching all repair requests:", error);
    throw error;
  }
};

/**
 * Get repairs by status (for admins or technicians).
 * @param {string} status - The status to filter by (PENDING, PROCESSING, COMPLETED, CANCELLED).
 * @returns {Promise<Array>} - List of filtered repair requests.
 */
export const getRepairsByStatus = async (status) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const response = await api.get(`/repairs/status/${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching repairs by status:", error);
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
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const response = await api.get(`/repairs/${repairId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching repair request by ID:", error);
    throw error;
  }
};

/**
 * Update a repair request status.
 * @param {string} repairId - The ID of the repair request to update.
 * @param {string} status - The new status (PENDING, PROCESSING, COMPLETED, CANCELLED).
 * @returns {Promise<Object>} - The updated repair request.
 */
export const updateRepairStatus = async (repairId, status) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const response = await api.patch(`/repairs/${repairId}/status?status=${status}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating repair status:", error);
    throw error;
  }
};

/**
 * Update a repair request details.
 * @param {string} repairId - The ID of the repair request to update.
 * @param {Object} updateData - The data to update the repair request.
 * @returns {Promise<Object>} - The updated repair request.
 */
export const updateRepairDetails = async (repairId, updateData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    // If status is included in updateData, handle it properly
    const { status, ...otherData } = updateData;
    
    let response;
    
    // If status is provided, use it to update the status first
    if (status) {
      // First update the status
      await api.patch(`/repairs/${repairId}/status?status=${status}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    
    // Then update the other details
    if (Object.keys(otherData).length > 0) {
      response = await api.put(`/repairs/${repairId}`, otherData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else if (status) {
      // If only status was updated, get the current repair
      response = await api.get(`/repairs/${repairId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    
    return response.data;
  } catch (error) {
    console.error("Error updating repair details:", error);
    throw error;
  }
};

/**
 * Get technician's assigned repairs.
 * @returns {Promise<Array>} - List of repairs assigned to the technician.
 */
export const getTechnicianRepairs = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const response = await api.get("/repairs/technician", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching technician repairs:", error);
    throw error;
  }
};

/**
 * Delete a repair request by ID.
 * @param {string} repairId - The ID of the repair request to delete.
 * @returns {Promise<void>} - A promise that resolves when the repair request is deleted.
 */
export const deleteRepairRequest = async (repairId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    await api.delete(`/repairs/${repairId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return;
  } catch (error) {
    console.error("Error deleting repair request:", error);
    throw error;
  }
};