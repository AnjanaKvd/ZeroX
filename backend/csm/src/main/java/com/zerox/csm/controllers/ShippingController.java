package com.zerox.csm.controllers;

import com.zerox.csm.dto.ShippingDto.ShippingCreateRequest;
import com.zerox.csm.dto.ShippingDto.ShippingResponse;
import com.zerox.csm.dto.ShippingDto.ShippingUpdateRequest;
import com.zerox.csm.service.ShippingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShippingResponse> createShipping(
            @Valid @RequestBody ShippingCreateRequest request
    ) {
        return ResponseEntity.ok(shippingService.createShipping(request));
    }
    
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ShippingResponse> getShippingByOrderId(
            @PathVariable UUID orderId
    ) {
        return ResponseEntity.ok(shippingService.getShippingByOrderId(orderId));
    }
    
    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<ShippingResponse> getShippingByTrackingNumber(
            @PathVariable String trackingNumber
    ) {
        return ResponseEntity.ok(shippingService.getShippingByTrackingNumber(trackingNumber));
    }
    
    @PutMapping("/{shippingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShippingResponse> updateShipping(
            @PathVariable UUID shippingId,
            @Valid @RequestBody ShippingUpdateRequest request
    ) {
        return ResponseEntity.ok(shippingService.updateShipping(shippingId, request));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ShippingResponse>> getAllShippings() {
        return ResponseEntity.ok(shippingService.getAllShippings());
    }
} 