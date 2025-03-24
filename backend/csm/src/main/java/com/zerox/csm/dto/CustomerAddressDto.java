package com.zerox.csm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CustomerAddressDto {
    
    public record AddressCreateRequest(
        @NotNull UUID userId,
        @NotBlank String street,
        @NotBlank String city,
        String state,
        @NotBlank String zipCode,
        Boolean isPrimary
    ) {}
    
    public record AddressUpdateRequest(
        @NotBlank String street,
        @NotBlank String city,
        String state,
        @NotBlank String zipCode,
        Boolean isPrimary
    ) {}
    
    public record AddressResponse(
        UUID addressId,
        UUID userId,
        String street,
        String city,
        String state,
        String zipCode,
        Boolean isPrimary
    ) {}
} 