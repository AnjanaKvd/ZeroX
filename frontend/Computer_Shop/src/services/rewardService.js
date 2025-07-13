import api from "./api";

// Get rewards summary for a user
export const getUserRewards = async(userId) => {
    try {
        const response = await api.get(`/rewards/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user rewards:", error);
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

// Claim selected reward points
export const claimRewards = async(userId, rewardIds) => {
    try {
        const response = await api.post("/rewards/claim", {
            userId,
            rewardIds,
        });
        return response.data;
    } catch (error) {
        console.error("Error claiming rewards:", error);
        throw error;
    }
};

// Redeem points
export const redeemPoints = async(pointsToRedeem) => {
    try {
        const response = await api.post("/rewards/redeem", { pointsToRedeem });
        return response.data;
    } catch (error) {
        console.error("Error redeeming points:", error);
        throw error;
    }
};

// Process all eligible orders for a user
export const processUserOrders = async(userId) => {
    try {
        const response = await api.post(`/rewards/process/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error processing user orders:", error);
        throw error;
    }
};

// Admin endpoint to manually generate points for a specific order
export const generatePointsForOrder = async(orderId) => {
    try {
        const response = await api.post(`/rewards/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error("Error generating points for order:", error);
        throw error;
    }
};

// Get all reward coupons for a user
export const getRewardCoupons = async(userId) => {
    const response = await api.get(`/rewards/${userId}/coupons`);
    return response.data;
};

// Generate a reward coupon for a user
export const generateRewardCoupon = async(userId, pointsToSpend) => {
    const response = await api.post(`/rewards/${userId}/generate-coupon`, {
        pointsToRedeem: pointsToSpend,
    });
    return response.data;
};