package com.zerox.csm.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class RewardDto {

    public record RewardCreateRequest(
            @NotNull UUID userId,
            @NotNull UUID orderId
    ) {}

    public record RewardRedeemRequest(
            @NotNull UUID userId,
            @Min(1) int pointsToRedeem
    ) {}

    public record RewardResponse(
            UUID rewardId,
            UUID userId,
            int year,
            BigDecimal totalSpent,
            int mainPoints,
            int bonusPoints,
            BigDecimal bonusPercent,
            int totalPoints,
            String loyaltyStatus,
            LocalDateTime createdAt,
            BigDecimal redeemedValue,
            int availablePoints
    ) {}

    public record RewardSummaryResponse(
            UUID userId,
            int totalPoints,
            int availablePoints,
            String loyaltyStatus
    ) {}


}
