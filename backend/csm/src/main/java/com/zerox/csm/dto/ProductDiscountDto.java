package com.zerox.csm.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ProductDiscountDto {
    public record DiscountRequest(
            @NotNull UUID productId,
            @NotNull @Positive BigDecimal discountPrice,
            @NotNull LocalDateTime startDate,
            @NotNull LocalDateTime endDate
    ) {}

    public record DiscountResponse(
            UUID discountId,
            UUID productId,
            String productName,
            String productSku,
            BigDecimal originalPrice,
            BigDecimal discountPrice,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Boolean active
    ) {}

    public record ActiveDiscountResponse(
            UUID discountId,
            UUID productId,
            String productName,
            String productSku,
            BigDecimal originalPrice,
            BigDecimal discountPrice,
            BigDecimal savingsAmount,
            Double savingsPercentage,
            LocalDateTime endDate
    ) {}
} 