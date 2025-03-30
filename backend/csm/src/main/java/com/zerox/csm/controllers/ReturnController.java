package com.zerox.csm.controllers;

import com.zerox.csm.dto.ReturnDto.ReturnCreateRequest;
import com.zerox.csm.dto.ReturnDto.ReturnResponse;
import com.zerox.csm.dto.ReturnDto.ReturnUpdateRequest;
import com.zerox.csm.service.ReturnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService returnService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ReturnResponse> createReturn(
            @Valid @RequestBody ReturnCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure customers can only create returns for their own orders
        return ResponseEntity.ok(returnService.createReturn(request));
    }
    
    @GetMapping("/{returnId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ReturnResponse> getReturn(
            @PathVariable UUID returnId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure customers can only view their own returns
        return ResponseEntity.ok(returnService.getReturn(returnId));
    }
    
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<ReturnResponse>> getReturnsByOrderId(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure customers can only view returns for their own orders
        return ResponseEntity.ok(returnService.getReturnsByOrderId(orderId));
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<ReturnResponse>> getUserReturns(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure customers can only view their own returns
        return ResponseEntity.ok(returnService.getUserReturns(userId));
    }
    
    @PutMapping("/{returnId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnResponse> updateReturn(
            @PathVariable UUID returnId,
            @Valid @RequestBody ReturnUpdateRequest request
    ) {
        return ResponseEntity.ok(returnService.updateReturn(returnId, request));
    }
} 