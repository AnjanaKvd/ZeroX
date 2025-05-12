package com.zerox.csm.model;

public enum LoyaltyTier {
    BRONZE(0, 999, 0.01),      // 1% points rate
    SILVER(1000, 4999, 0.02),  // 2% points rate
    GOLD(5000, 9999, 0.03),    // 3% points rate
    PLATINUM(10000, Integer.MAX_VALUE, 0.05);  // 5% points rate

    private final int minPoints;
    private final int maxPoints;
    private final double pointsRate;

    LoyaltyTier(int minPoints, int maxPoints, double pointsRate) {
        this.minPoints = minPoints;
        this.maxPoints = maxPoints;
        this.pointsRate = pointsRate;
    }

    public int getMinPoints() {
        return minPoints;
    }

    public int getMaxPoints() {
        return maxPoints;
    }

    public double getPointsRate() {
        return pointsRate;
    }

    public static LoyaltyTier fromPoints(int points) {
        for (LoyaltyTier tier : values()) {
            if (points >= tier.getMinPoints() && points <= tier.getMaxPoints()) {
                return tier;
            }
        }
        return BRONZE; // Default tier
    }
}