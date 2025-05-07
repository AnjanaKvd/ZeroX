package com.zerox.csm.service;

import com.zerox.csm.dto.RewardDto.*;
import com.zerox.csm.model.Order;
import com.zerox.csm.model.OrderStatus;
import com.zerox.csm.model.Reward;
import com.zerox.csm.model.User;
import com.zerox.csm.repository.OrderRepository;
import com.zerox.csm.repository.RewardRepository;
import com.zerox.csm.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardRepository rewardRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    private static final int POINT_RATE = 500; // 1 point per 500 LKR
    private static final BigDecimal REWARD_VALUE = BigDecimal.valueOf(5); // 1 point = 5 LKR

    @Transactional
    public RewardResponse createOrUpdateReward(RewardCreateRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new IllegalArgumentException("Order Not Found"));

        if (!order.getStatus().equals(OrderStatus.DELIVERED)) {
            throw new IllegalStateException("Reward points can only be earned after delivery.");
        }

        int currentYear = LocalDate.now().getYear();
        BigDecimal totalSpent = order.getTotalAmount();
        int earnedMainPoints = totalSpent.divide(BigDecimal.valueOf(POINT_RATE)).intValue();

        Reward reward = rewardRepository.findByUserAndYear(user, currentYear)
                .orElse(Reward.builder()
                        .user(user)
                        .year(currentYear)
                        .totalSpent(BigDecimal.ZERO)
                        .mainPoints(0)
                        .bonusPoints(0)
                        .bonusPercent(BigDecimal.ZERO)
                        .totalPoints(0)
                        .redeemedPoints(0)
                        .loyaltyStatus(Reward.LoyaltyStatus.Bronze)
                        .build()
                );

        reward.setTotalSpent(reward.getTotalSpent().add(totalSpent));
        reward.setMainPoints(reward.getMainPoints() + earnedMainPoints);

        // Determine loyalty status and bonus
        BigDecimal totalYearSpent = reward.getTotalSpent();
        BigDecimal bonusPercent = BigDecimal.ZERO;
        int bonusPoints = 0;
        Reward.LoyaltyStatus status = Reward.LoyaltyStatus.Bronze;

        if (totalYearSpent.compareTo(BigDecimal.valueOf(500_000)) >= 0) {
            status = Reward.LoyaltyStatus.Gold;
            bonusPoints = 750;
            bonusPercent = BigDecimal.valueOf(12);
        } else if (totalYearSpent.compareTo(BigDecimal.valueOf(250_000)) >= 0) {
            status = Reward.LoyaltyStatus.Silver;
            bonusPoints = 300;
            bonusPercent = BigDecimal.valueOf(5);
        }

        reward.setBonusPoints(bonusPoints);
        reward.setBonusPercent(bonusPercent);
        reward.setLoyaltyStatus(status);

        int bonusFromPercent = reward.getMainPoints() * bonusPercent.intValue() / 100;
        reward.setTotalPoints(reward.getMainPoints() + bonusPoints + bonusFromPercent);

        rewardRepository.save(reward);

        return mapToResponse(reward, BigDecimal.ZERO);
    }

    @Transactional
    public RewardResponse redeemPoints(RewardRedeemRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        int currentYear = LocalDate.now().getYear();

        Reward reward = rewardRepository.findByUserAndYear(user, currentYear)
                .orElseThrow(() -> new IllegalArgumentException("No reward points for this year"));

        int available = reward.getAvailablePoints();
        if (request.pointsToRedeem() > available) {
            throw new IllegalArgumentException("Not enough points to redeem.");
        }

        reward.setRedeemedPoints(reward.getRedeemedPoints() + request.pointsToRedeem());
        rewardRepository.save(reward);

        BigDecimal redeemedValue = REWARD_VALUE.multiply(BigDecimal.valueOf(request.pointsToRedeem()));

        return mapToResponse(reward, redeemedValue);
    }

    private RewardResponse mapToResponse(Reward reward, BigDecimal redeemedValue) {
        return new RewardResponse(
                reward.getRewardId(),
                reward.getUser().getUserId(),
                reward.getYear(),
                reward.getTotalSpent(),
                reward.getMainPoints(),
                reward.getBonusPoints(),
                reward.getBonusPercent(),
                reward.getTotalPoints(),
                reward.getLoyaltyStatus().name(),
                reward.getCreatedAt(),
                redeemedValue,
                reward.getAvailablePoints()
        );
    }
}
