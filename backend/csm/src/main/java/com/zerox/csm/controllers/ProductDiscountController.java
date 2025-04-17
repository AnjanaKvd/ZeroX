package com.zerox.csm.controllers;

import com.zerox.csm.dto.ProductDiscountDto;
import com.zerox.csm.service.ProductDiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class ProductDiscountController {
    private final ProductDiscountService discountService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDiscountDto.DiscountResponse> createDiscount(
            @Valid @RequestBody ProductDiscountDto.DiscountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(discountService.createDiscount(request));
    }

    @GetMapping
    public ResponseEntity<Page<ProductDiscountDto.DiscountResponse>> getAllDiscounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        return ResponseEntity.ok(discountService.getAllDiscounts(page, size));
    }

    @GetMapping("/active")
    public ResponseEntity<Page<ProductDiscountDto.ActiveDiscountResponse>> getActiveDiscounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        return ResponseEntity.ok(discountService.getActiveDiscounts(page, size));
    }

    @GetMapping("/active/all")
    public ResponseEntity<List<ProductDiscountDto.ActiveDiscountResponse>> getAllActiveDiscounts() {
        return ResponseEntity.ok(discountService.getAllActiveDiscounts());
    }

    @GetMapping("/{discountId}")
    public ResponseEntity<ProductDiscountDto.DiscountResponse> getDiscountById(
            @PathVariable UUID discountId) {
        
        return ResponseEntity.ok(discountService.getDiscountById(discountId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductDiscountDto.DiscountResponse>> getDiscountsByProductId(
            @PathVariable UUID productId) {
        
        return ResponseEntity.ok(discountService.getDiscountsByProductId(productId));
    }

    @GetMapping("/product/{productId}/active")
    public ResponseEntity<ProductDiscountDto.ActiveDiscountResponse> getActiveDiscountForProduct(
            @PathVariable UUID productId) {
        
        return ResponseEntity.ok(discountService.getActiveDiscountForProduct(productId));
    }

    @PutMapping("/{discountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDiscountDto.DiscountResponse> updateDiscount(
            @PathVariable UUID discountId,
            @Valid @RequestBody ProductDiscountDto.DiscountRequest request) {
        return ResponseEntity.ok(discountService.updateDiscount(discountId, request));
    }

    @DeleteMapping("/{discountId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDiscount(@PathVariable UUID discountId) {
        discountService.deleteDiscount(discountId);
        return ResponseEntity.noContent().build();
    }
} 