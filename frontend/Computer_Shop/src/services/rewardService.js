import api from "./api";

// Get reward summary for the user
export const getRewardSummary = async () => {
    try {
        const response = await api.get('/rewards/summary');
        return response.data;
    } catch (error) {
        console.error("Error fetching reward summary:", error);
        throw error;
    }
};

// Get delivered items (for rewards) of the user
export const getDeliveredItems = async(userId) => {
    try {
        console.log(`Fetching delivered items for user ID: ${userId}`);
        const response = await api.get(`/orders/user/${userId}`, {
            params: { status: "DELIVERED" },
        });
        console.log("Delivered items response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching delivered items:", error);
        throw error;
    }
};

// Earn reward for a specific order
export const earnReward = async(userId, orderId) => {
    try {
        const response = await api.post(`/rewards/earn`, {
            userId,
            orderId,
        });
        return response.data;
    } catch (error) {
        console.error("Error earning reward:", error);
        throw error;
    }
};

// Claim available rewards
export const claimRewards = async () => {
    try {
        const response = await api.post('/rewards/claim');
        return response.data;
    } catch (error) {
        console.error("Error claiming rewards:", error);
        throw error;
    }
};

// Redeem points
export const redeemPoints = async (pointsToRedeem) => {
    try {
        const response = await api.post('/rewards/redeem', { pointsToRedeem });
        return response.data;
    } catch (error) {
        console.error("Error redeeming points:", error);
        throw error;
    }
};

// Process order rewards (typically called by system after delivery)
export const processOrderRewards = async (orderId) => {
    try {
        const response = await api.post('/rewards/process', { orderId });
        return response.data;
    } catch (error) {
        console.error("Error processing order rewards:", error);
        throw error;
    }
};