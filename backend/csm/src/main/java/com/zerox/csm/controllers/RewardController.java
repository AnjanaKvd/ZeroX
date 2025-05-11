package com.zerox.csm.controllers;

import com.zerox.csm.dto.RewardDto.*;
import com.zerox.csm.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;



    //localhost:8080/api/rewards/earn
    @PostMapping("/earn")
    public ResponseEntity<RewardResponse> earnPoints(@Valid @RequestBody RewardCreateRequest request) {
        return ResponseEntity.ok(rewardService.createOrUpdateReward(request));
    }

    //localhost:8080/api/rewards/redeem
    @PostMapping("/redeem")
    public ResponseEntity<RewardResponse> redeemPoints(@Valid @RequestBody RewardRedeemRequest request) {
        return ResponseEntity.ok(rewardService.redeemPoints(request));
    }

    // GET localhost:8080/api/rewards/summary/{userId}
    @GetMapping("/summary/{userId}")
    public ResponseEntity<RewardSummaryResponse> getRewardSummary(@PathVariable UUID userId) {
        return ResponseEntity.ok(rewardService.getRewardSummaryByUserId(userId));
    }
}
