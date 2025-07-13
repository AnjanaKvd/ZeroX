package com.zerox.csm.repository;

import com.zerox.csm.model.RewardPoints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RewardPointsRepository extends JpaRepository<RewardPoints, UUID> {
    List<RewardPoints> findByUserUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<RewardPoints> findByOrderOrderId(UUID orderId);

    @Query("SELECT SUM(rp.pointsEarned) FROM RewardPoints rp WHERE rp.user.userId = :userId AND rp.claimed = true")
    Integer getTotalClaimedPointsByUserId(@Param("userId") UUID userId);

    @Query("SELECT SUM(rp.pointsEarned) FROM RewardPoints rp WHERE rp.user.userId = :userId AND rp.claimed = false")
    Integer getTotalUnclaimedPointsByUserId(@Param("userId") UUID userId);

    List<RewardPoints> findByUserUserIdAndClaimedOrderByCreatedAtDesc(UUID userId, boolean claimed);
   
    @Modifying
    @Query("DELETE FROM RewardPoints rp WHERE rp.user.userId = :userId")
    int deleteByUserUserId(@Param("userId") UUID userId);

    @Query("SELECT SUM(r.pointsEarned) FROM RewardPoints r WHERE r.user.userId = :userId")
    Integer getTotalPointsByUserId(@Param("userId") UUID userId);
}