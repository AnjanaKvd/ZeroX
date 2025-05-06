package com.zerox.csm.controllers;

import com.zerox.csm.dto.CouponDto;
import com.zerox.csm.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDto.CouponResponse> createCoupon(
            @Valid @RequestBody CouponDto.CouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponService.createCoupon(request));
    }
    
    @GetMapping("/{couponId}")
    public ResponseEntity<CouponDto.CouponResponse> getCoupon(@PathVariable UUID couponId) {
        return ResponseEntity.ok(couponService.getCoupon(couponId));
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<CouponDto.CouponResponse> getCouponByCode(@PathVariable String code) {
        return ResponseEntity.ok(couponService.getCouponByCode(code));
    }
    
    @GetMapping
    public ResponseEntity<Page<CouponDto.CouponResponse>> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "code") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(couponService.getAllCoupons(pageRequest));
    }
    
    @GetMapping("/active")
    public ResponseEntity<Page<CouponDto.CouponResponse>> getActiveCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size);
        return ResponseEntity.ok(couponService.getActiveCoupons(pageRequest));
    }
    
    @GetMapping("/valid")
    public ResponseEntity<Page<CouponDto.CouponResponse>> getValidCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size);
        return ResponseEntity.ok(couponService.getValidCoupons(pageRequest));
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<CouponDto.CouponResponse>> searchCoupons(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size);
        return ResponseEntity.ok(couponService.searchCoupons(code, isActive, pageRequest));
    }
    
    @PutMapping("/{couponId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDto.CouponResponse> updateCoupon(
            @PathVariable UUID couponId,
            @Valid @RequestBody CouponDto.CouponRequest request) {
        return ResponseEntity.ok(couponService.updateCoupon(couponId, request));
    }
    
    @DeleteMapping("/{couponId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable UUID couponId) {
        couponService.deleteCoupon(couponId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/validate")
    public ResponseEntity<CouponDto.CouponValidationResponse> validateCoupon(
            @Valid @RequestBody CouponDto.CouponValidationRequest request) {
        return ResponseEntity.ok(couponService.validateCoupon(request));
    }
    
    @GetMapping("/{couponId}/usages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CouponDto.CouponUsageResponse>> getCouponUsages(
            @PathVariable UUID couponId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size);
        return ResponseEntity.ok(couponService.getCouponUsages(couponId, pageRequest));
    }
    
    @GetMapping("/usages/user/{userId}")
    public ResponseEntity<Page<CouponDto.CouponUsageResponse>> getUserCouponUsages(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageRequest = PageRequest.of(page, size);
        return ResponseEntity.ok(couponService.getUserCouponUsages(userId, pageRequest));
    }
} 