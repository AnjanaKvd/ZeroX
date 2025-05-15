package com.zerox.csm.controllers;

import com.zerox.csm.dto.RewardPointsDto.*;
import com.zerox.csm.service.RewardPointsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardPointsController {

    private final RewardPointsService rewardPointsService;

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
}