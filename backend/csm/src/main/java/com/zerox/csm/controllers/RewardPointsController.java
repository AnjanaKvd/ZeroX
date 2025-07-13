package com.zerox.csm.controllers;

import com.zerox.csm.dto.CouponDto;
import com.zerox.csm.dto.RewardPointsDto.*;
import com.zerox.csm.model.Coupon;
import com.zerox.csm.repository.CouponRepository;
import com.zerox.csm.service.RewardPointsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.querydsl.ListQuerydslPredicateExecutor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.webauthn.management.MapUserCredentialRepository;
import org.springframework.web.bind.annotation.*;

import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardPointsController {

    private final RewardPointsService rewardPointsService;
    private final CouponRepository couponRepository;

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<UserRewardsResponse> getUserRewards(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Validate that user is accessing their own rewards or is an admin

        return ResponseEntity.ok(rewardPointsService.getUserRewards(userId));
    }

    @PostMapping("/claim")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<ClaimPointsResponse> claimPoints(
            @RequestBody ClaimPointsRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Validate that user is claiming their own rewards

        return ResponseEntity.ok(rewardPointsService.claimPoints(request));
    }

    @PostMapping("/process/{userId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<RewardPointsResponse>> processUserOrders(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Process all eligible orders and generate rewards

        return ResponseEntity.ok(rewardPointsService.processUserOrders(userId));
    }

    @PostMapping("/orders/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RewardPointsResponse> generatePointsForOrder(
            @PathVariable UUID orderId) {
        // Admin endpoint to manually generate points for an order

        return ResponseEntity.ok(rewardPointsService.generatePointsForOrder(orderId));
    }


    //localhost:8080/api/rewards/{userId}/generate-coupon
    @PostMapping("/{userId}/generate-coupon")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RewardToCouponResponse> redeemPointsToCoupon(
            @PathVariable UUID userId,
            @RequestBody RewardToCouponRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(rewardPointsService.redeemPointsToCoupon(userId, request));
    }

    //localhost:8080/api/rewards/{userId}/coupons
    @GetMapping("/{userId}/coupons")
    public ResponseEntity<List<RewardToCouponResponse>> getCoupons(@PathVariable UUID userId) {
        List<Coupon> coupons = couponRepository.findByUserUserId(userId);

        List<RewardToCouponResponse> result = coupons.stream()
                .map(c -> new RewardToCouponResponse(
                        c.getCode(),
                        c.getDiscountValue(),
                        "LKR " + c.getDiscountValue().setScale(2, RoundingMode.HALF_UP),
                        c.getEndDate()
                ))
                .toList();

        return ResponseEntity.ok(result);
    }


}