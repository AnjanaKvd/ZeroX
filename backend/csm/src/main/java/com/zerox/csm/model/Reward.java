package com.zerox.csm.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "rewards",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "year"})}
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reward {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "reward_id")
    private UUID rewardId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int year;

    @Column(name = "total_spent", nullable = false, precision = 38, scale = 2)
    private BigDecimal totalSpent;

    @Column(name = "main_points", nullable = false)
    private int mainPoints;

    @Column(name = "bonus_points", nullable = false)
    private int bonusPoints;

    @Column(name = "total_points", nullable = false)
    private int totalPoints;

    @Column(name = "redeemed_points", nullable = false)
    private int redeemedPoints;

    @Enumerated(EnumType.STRING)
    @Column(name = "loyalty_status", nullable = false)
    private LoyaltyStatus loyaltyStatus;

    @CreationTimestamp
    @Column(name = "created_at", columnDefinition = "DATETIME(6)", updatable = false)
    private LocalDateTime createdAt;

    public enum LoyaltyStatus {
        Bronze,
        Silver,
        Gold
    }

    //Added a column for available points
    @Column(name = "available_points")
    private int availablePoints;

    // method to get available points
    @JsonProperty("available_points")
    public int getAvailablePoints() {
        return totalPoints - redeemedPoints;
    }

}
