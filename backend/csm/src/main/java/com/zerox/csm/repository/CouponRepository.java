package com.zerox.csm.repository;

import com.zerox.csm.model.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    Optional<Coupon> findByCode(String code);

    List<Coupon> findByUserUserId(UUID userId);


    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.startDate <= :now AND c.endDate >= :now")
    Page<Coupon> findActiveCoupons(@Param("now") LocalDateTime now, Pageable pageable);
    
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND c.startDate <= :now AND c.endDate >= :now " +
           "AND (c.maxUses IS NULL OR c.currentUses < c.maxUses)")
    Page<Coupon> findValidCoupons(@Param("now") LocalDateTime now, Pageable pageable);
    
    @Query("SELECT c FROM Coupon c WHERE " +
           "(:code IS NULL OR c.code LIKE %:code%) AND " +
           "(:isActive IS NULL OR c.isActive = :isActive)")
    Page<Coupon> searchCoupons(
            @Param("code") String code,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
} 