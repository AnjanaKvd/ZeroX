package com.zerox.csm.dto;

import com.zerox.csm.model.Discount.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class DiscountDto {
    
    public record DiscountCreateRequest(
        @NotBlank String code,
        @NotNull DiscountType discountType,
        @Positive BigDecimal value,
        Integer maxUses,
        LocalDateTime validFrom,
        LocalDateTime validUntil
    ) {}
    
    public record DiscountUpdateRequest(
        @NotNull DiscountType discountType,
        @Positive BigDecimal value,
        Integer maxUses,
        LocalDateTime validFrom,
        LocalDateTime validUntil
    ) {}
    
    public record DiscountResponse(
        UUID discountId,
        String code,
        DiscountType discountType,
        BigDecimal value,
        Integer maxUses,
        LocalDateTime validFrom,
        LocalDateTime validUntil
    ) {}
    
    public record DiscountApplyRequest(
        @NotBlank String code
    ) {}
    
    public record DiscountVerifyResponse(
        boolean valid,
        String code,
        DiscountType discountType,
        BigDecimal value,
        String message
    ) {}
} 