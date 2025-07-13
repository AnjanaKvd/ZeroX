package com.zerox.csm.service;

import com.zerox.csm.dto.RewardPointsDto.*;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.exception.ValidationException;
import com.zerox.csm.model.*;
import com.zerox.csm.repository.CouponRepository;
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
    private final CouponRepository couponRepository;

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
//        LoyaltyTier tier = LoyaltyTier.fromPoints(user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0);
        Integer lifetimePoints = rewardPointsRepository.getTotalPointsByUserId(user.getUserId());
        if (lifetimePoints == null) lifetimePoints = 0;

        LoyaltyTier tier = LoyaltyTier.fromPoints(lifetimePoints);


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

        Integer unclaimedPoints = rewardPointsRepository.getTotalUnclaimedPointsByUserId(userId);
        if (unclaimedPoints == null) unclaimedPoints = 0;

        Integer claimedPoints = rewardPointsRepository.getTotalClaimedPointsByUserId(userId);
        if (claimedPoints == null) claimedPoints = 0;

        // ✅ Lifetime points calculated dynamically!
        Integer lifetimePoints = rewardPointsRepository.getTotalPointsByUserId(userId);
        if (lifetimePoints == null) lifetimePoints = 0;

        LoyaltyTier currentTier = LoyaltyTier.fromPoints(lifetimePoints);

        int pointsToNextTier = 0;
        if (currentTier != LoyaltyTier.PLATINUM) {
            LoyaltyTier nextTier = LoyaltyTier.values()[currentTier.ordinal() + 1];
            pointsToNextTier = nextTier.getMinPoints() - lifetimePoints;
        }

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
                lifetimePoints,
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

    //pay from reward points
    @Transactional
    public RewardToCouponResponse redeemPointsToCoupon(UUID userId, RewardToCouponRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
        if (currentPoints < request.pointsToRedeem()) {
            throw new ValidationException("Not enough points");
        }

        // Deduct points
        user.setLoyaltyPoints(currentPoints - request.pointsToRedeem());
        userRepository.save(user);

        BigDecimal discountValue = new BigDecimal(request.pointsToRedeem());

        Coupon coupon = Coupon.builder()
                .code("REWARD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .description("Coupon generated from reward points")
                .discountType(Coupon.DiscountType.FIXED_AMOUNT)
                .discountValue(discountValue)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusYears(1))
                .isActive(true)
                .currentUses(0)
                .maxUses(1)
                .maxUsesPerUser(1)
                .createdAt(LocalDateTime.now())
                .user(user) 
                .build();

        couponRepository.save(coupon);

        String formattedValue = "LKR " + discountValue.setScale(2, RoundingMode.HALF_UP);

        return new RewardToCouponResponse(
                coupon.getCode(),
                discountValue,
                formattedValue,
                coupon.getEndDate()
        );
    }


}