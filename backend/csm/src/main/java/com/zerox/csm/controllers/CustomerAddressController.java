package com.zerox.csm.controllers;

import com.zerox.csm.dto.CustomerAddressDto.AddressCreateRequest;
import com.zerox.csm.dto.CustomerAddressDto.AddressResponse;
import com.zerox.csm.dto.CustomerAddressDto.AddressUpdateRequest;
import com.zerox.csm.service.CustomerAddressService;
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
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class CustomerAddressController {

    private final CustomerAddressService addressService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<AddressResponse> createAddress(
            @Valid @RequestBody AddressCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure users can only create addresses for themselves
        return ResponseEntity.ok(addressService.createAddress(request));
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<AddressResponse>> getUserAddresses(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure users can only view their own addresses
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }
    
    @GetMapping("/{addressId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<AddressResponse> getAddress(
            @PathVariable UUID addressId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure users can only view their own addresses
        return ResponseEntity.ok(addressService.getAddress(addressId));
    }
    
    @PutMapping("/{addressId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable UUID addressId,
            @Valid @RequestBody AddressUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure users can only update their own addresses
        return ResponseEntity.ok(addressService.updateAddress(addressId, request));
    }
    
    @DeleteMapping("/{addressId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable UUID addressId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Authorization logic: ensure users can only delete their own addresses
        addressService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }
} 