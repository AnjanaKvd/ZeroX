package com.zerox.csm.dto;

import com.zerox.csm.model.LoyaltyTier;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RewardPointsDto {
    public record RewardPointsResponse(
            UUID rewardId,
            UUID orderId,
            int pointsEarned,
            boolean claimed,
            LocalDateTime claimedAt,
            LocalDateTime createdAt,
            LocalDateTime expirationDate
    ) {}

    public record UserRewardsResponse(
            int totalPoints,
            int availablePoints,
            int claimedPoints,
            LoyaltyTier currentTier,
            double currentPointsRate,
            int pointsToNextTier,
            int lifeTimePoints,
            List<RewardPointsResponse> recentRewards
    ) {}

    public record ClaimPointsRequest(
            UUID userId,
            List<UUID> rewardIds
    ) {}

    public record ClaimPointsResponse(
            int pointsClaimed,
            int totalPointsAfterClaim,
            LoyaltyTier newTier
    ) {}

    //pay from reward points
    public record RewardToCouponRequest(
            int pointsToRedeem
    ) {}
    public record RewardToCouponResponse(
            String code,
            BigDecimal discountValue,
            String discountValueFormatted,
            LocalDateTime validUntil
    ) {}



}