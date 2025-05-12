package com.zerox.csm.controllers;

import com.zerox.csm.dto.CustomerAddressDto.AddressRequest;
import com.zerox.csm.dto.CustomerAddressDto.AddressResponse;
import com.zerox.csm.dto.CustomerAddressDto.SetDefaultAddressRequest;
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

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<AddressResponse>> getUserAddresses(@PathVariable UUID userId) {
        // Authorization: ensure customer can only view their own addresses (handled in security config)
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }

    @GetMapping("/{addressId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<AddressResponse> getAddress(@PathVariable UUID addressId) {
        // Authorization: ensure customer can only view their own addresses (handled in security config)
        return ResponseEntity.ok(addressService.getAddress(addressId));
    }

    @PostMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<AddressResponse> createAddress(
            @PathVariable UUID userId,
            @Valid @RequestBody AddressRequest request
    ) {
        // Authorization: ensure customer can only create addresses for themselves (handled in security config)
        return ResponseEntity.ok(addressService.createAddress(userId, request));
    }

    @PutMapping("/{addressId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable UUID addressId,
            @Valid @RequestBody AddressRequest request
    ) {
        // Authorization: ensure customer can only update their own addresses (handled in security config)
        return ResponseEntity.ok(addressService.updateAddress(addressId, request));
    }

    @DeleteMapping("/{addressId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Void> deleteAddress(@PathVariable UUID addressId) {
        // Authorization: ensure customer can only delete their own addresses (handled in security config)
        addressService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/user/{userId}/default")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<AddressResponse> setDefaultAddress(
            @PathVariable UUID userId,
            @Valid @RequestBody SetDefaultAddressRequest request
    ) {
        // Authorization: ensure customer can only set default for their own addresses (handled in security config)
        return ResponseEntity.ok(addressService.setDefaultAddress(userId, request.addressId()));
    }
}