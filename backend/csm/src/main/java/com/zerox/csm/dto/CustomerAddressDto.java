package com.zerox.csm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CustomerAddressDto {

    public record AddressRequest(
            @NotBlank String fullName,
            @NotBlank String addressLine1,
            String addressLine2,
            @NotBlank String city,
            String state,
            @NotBlank String zipCode,
            @NotBlank String country,
            Boolean isDefault
    ) {}

    public record AddressResponse(
            UUID addressId,
            String fullName,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String zipCode,
            String country,
            Boolean isDefault
    ) {}

    public record SetDefaultAddressRequest(
            @NotNull UUID addressId
    ) {}
}