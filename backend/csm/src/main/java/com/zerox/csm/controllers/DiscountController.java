package com.zerox.csm.controllers;

import com.zerox.csm.dto.DiscountDto.*;
import com.zerox.csm.service.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountResponse> createDiscount(
            @Valid @RequestBody DiscountCreateRequest request
    ) {
        return ResponseEntity.ok(discountService.createDiscount(request));
    }
    
    @GetMapping("/{discountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountResponse> getDiscount(
            @PathVariable UUID discountId
    ) {
        return ResponseEntity.ok(discountService.getDiscount(discountId));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DiscountResponse>> getAllDiscounts() {
        return ResponseEntity.ok(discountService.getAllDiscounts());
    }
    
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DiscountResponse>> getActiveDiscounts() {
        return ResponseEntity.ok(discountService.getActiveDiscounts());
    }
    
    @PutMapping("/{discountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountResponse> updateDiscount(
            @PathVariable UUID discountId,
            @Valid @RequestBody DiscountUpdateRequest request
    ) {
        return ResponseEntity.ok(discountService.updateDiscount(discountId, request));
    }
    
    @DeleteMapping("/{discountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDiscount(
            @PathVariable UUID discountId
    ) {
        discountService.deleteDiscount(discountId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/verify")
    public ResponseEntity<DiscountVerifyResponse> verifyDiscount(
            @Valid @RequestBody DiscountApplyRequest request
    ) {
        return ResponseEntity.ok(discountService.verifyDiscount(request.code()));
    }
} 