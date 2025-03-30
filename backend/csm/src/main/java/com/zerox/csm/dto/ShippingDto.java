package com.zerox.csm.dto;

import com.zerox.csm.model.Shipping.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class ShippingDto {
    
    public record ShippingCreateRequest(
        @NotNull UUID orderId,
        @NotBlank String carrier,
        String trackingNumber,
        LocalDate estimatedDelivery
    ) {}
    
    public record ShippingUpdateRequest(
        String trackingNumber,
        @NotNull Status status,
        LocalDate estimatedDelivery
    ) {}
    
    public record ShippingResponse(
        UUID shippingId,
        UUID orderId,
        String trackingNumber,
        String carrier,
        Status status,
        LocalDate estimatedDelivery
    ) {}
} 