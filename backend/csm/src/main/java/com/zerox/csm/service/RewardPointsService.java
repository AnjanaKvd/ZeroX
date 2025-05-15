package com.zerox.csm.service;

import com.zerox.csm.dto.RewardPointsDto.*;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.*;
import com.zerox.csm.repository.OrderRepository;
import com.zerox.csm.repository.RewardPointsRepository;
import com.zerox.csm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardPointsService {

    private final RewardPointsRepository rewardPointsRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    private static final int POINTS_EXPIRATION_MONTHS = 12;

    /**
     * Calculate and generate reward points for a completed order
     */
    @Transactional
    public RewardPointsResponse generatePointsForOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Check if order is delivered
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Points can only be generated for delivered orders");
        }

        // Check if points already exist for this order
        if (rewardPointsRepository.findByOrderOrderId(orderId).isPresent()) {
            throw new IllegalStateException("Points already generated for this order");
        }

        User user = order.getUser();
        LoyaltyTier tier = LoyaltyTier.fromPoints(user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0);

        // Calculate points (based on final amount after any discounts)
        int pointsEarned = calculatePointsForAmount(order.getFinalAmount(), tier.getPointsRate());

        RewardPoints rewardPoints = RewardPoints.builder()
                .user(user)
                .order(order)
                .pointsEarned(pointsEarned)
                .claimed(false)
                .createdAt(LocalDateTime.now())
                .expirationDate(LocalDateTime.now().plusMonths(POINTS_EXPIRATION_MONTHS))
                .build();

        RewardPoints savedReward = rewardPointsRepository.save(rewardPoints);

        return mapToRewardPointsResponse(savedReward);
    }

    /**
     * Calculate points based on order amount and points rate
     */
    private int calculatePointsForAmount(BigDecimal amount, double pointsRate) {
        return amount.multiply(BigDecimal.valueOf(pointsRate))
                .setScale(0, RoundingMode.DOWN)
                .intValue();
    }

    /**
     * Get a user's reward summary information
     */
    public UserRewardsResponse getUserRewards(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int totalPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;

        // Get unclaimed points
        Integer unclaimedPoints = rewardPointsRepository.getTotalUnclaimedPointsByUserId(userId);
        if (unclaimedPoints == null) unclaimedPoints = 0;

        // Get claimed points
        Integer claimedPoints = rewardPointsRepository.getTotalClaimedPointsByUserId(userId);
        if (claimedPoints == null) claimedPoints = 0;

        // Calculate current tier and points to next tier
        LoyaltyTier currentTier = LoyaltyTier.fromPoints(totalPoints);
        int pointsToNextTier = 0;

        if (currentTier != LoyaltyTier.PLATINUM) {
            LoyaltyTier nextTier = LoyaltyTier.values()[currentTier.ordinal() + 1];
            pointsToNextTier = nextTier.getMinPoints() - totalPoints;
        }

        // Get recent rewards
        List<RewardPoints> recentRewards = rewardPointsRepository
                .findByUserUserIdOrderByCreatedAtDesc(userId);

        List<RewardPointsResponse> recentRewardsResponse = recentRewards.stream()
                .map(this::mapToRewardPointsResponse)
                .collect(Collectors.toList());

        return new UserRewardsResponse(
                totalPoints,
                unclaimedPoints,
                claimedPoints,
                currentTier,
                currentTier.getPointsRate(),
                pointsToNextTier,
                recentRewardsResponse
        );
    }

    /**
     * Claim reward points for a user
     */
    @Transactional
    public ClaimPointsResponse claimPoints(ClaimPointsRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<RewardPoints> rewardsToClaim = new ArrayList<>();

        // Validate all reward IDs belong to the user and are unclaimed
        for (UUID rewardId : request.rewardIds()) {
            RewardPoints reward = rewardPointsRepository.findById(rewardId)
                    .orElseThrow(() -> new ResourceNotFoundException("Reward not found with ID: " + rewardId));

            if (!reward.getUser().getUserId().equals(user.getUserId())) {
                throw new IllegalArgumentException("Reward does not belong to this user: " + rewardId);
            }

            if (reward.isClaimed()) {
                throw new IllegalArgumentException("Reward already claimed: " + rewardId);
            }

            rewardsToClaim.add(reward);
        }

        int pointsToAdd = 0;

        // Mark all rewards as claimed
        for (RewardPoints reward : rewardsToClaim) {
            reward.setClaimed(true);
            reward.setClaimedAt(LocalDateTime.now());
            pointsToAdd += reward.getPointsEarned();
            rewardPointsRepository.save(reward);
        }

        // Update user loyalty points
        int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
        int newTotalPoints = currentPoints + pointsToAdd;
        user.setLoyaltyPoints(newTotalPoints);
        userRepository.save(user);

        // Determine new loyalty tier
        LoyaltyTier newTier = LoyaltyTier.fromPoints(newTotalPoints);

        return new ClaimPointsResponse(
                pointsToAdd,
                newTotalPoints,
                newTier
        );
    }

    /**
     * Check all orders for a user and generate points if eligible
     */
    @Transactional
    public List<RewardPointsResponse> processUserOrders(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get all DELIVERED orders for the user (we would need to modify OrderRepository for this)
        List<Order> deliveredOrders = orderRepository.findByUserUserIdAndStatus(userId, OrderStatus.DELIVERED);
        List<RewardPointsResponse> generatedRewards = new ArrayList<>();

        for (Order order : deliveredOrders) {
            // Skip if points already generated
            if (rewardPointsRepository.findByOrderOrderId(order.getOrderId()).isPresent()) {
                continue;
            }

            try {
                RewardPointsResponse reward = generatePointsForOrder(order.getOrderId());
                generatedRewards.add(reward);
            } catch (Exception e) {
                // Log error and continue with next order
                System.err.println("Error generating points for order: " + order.getOrderId() + " - " + e.getMessage());
            }
        }

        return generatedRewards;
    }

    private RewardPointsResponse mapToRewardPointsResponse(RewardPoints rewardPoints) {
        return new RewardPointsResponse(
                rewardPoints.getRewardId(),
                rewardPoints.getOrder().getOrderId(),
                rewardPoints.getPointsEarned(),
                rewardPoints.isClaimed(),
                rewardPoints.getClaimedAt(),
                rewardPoints.getCreatedAt(),
                rewardPoints.getExpirationDate()
        );
    }
}