package com.zerox.csm.repository;

import com.zerox.csm.model.Coupon;
import com.zerox.csm.model.CouponUsage;
import com.zerox.csm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, UUID> {
    int countByCouponAndUser(Coupon coupon, User user);
    
    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.couponId = :couponId")
    int countUsagesByCouponId(@Param("couponId") UUID couponId);
    
    Page<CouponUsage> findByCoupon(Coupon coupon, Pageable pageable);
    
    Page<CouponUsage> findByUser(User user, Pageable pageable);
    
    @Modifying
    @Query("DELETE FROM CouponUsage cu WHERE cu.user = :user")
    int deleteByUser(@Param("user") User user);
} 