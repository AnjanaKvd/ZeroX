package com.zerox.csm.dto;

import com.zerox.csm.model.Coupon;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class CouponDto {
    
    public record CouponRequest(
            @NotBlank(message = "Coupon code is required") 
            @Size(min = 3, max = 30, message = "Coupon code must be between 3 and 30 characters")
            String code,
            
            String description,
            
            @NotNull(message = "Discount type is required")
            Coupon.DiscountType discountType,
            
            @NotNull(message = "Discount value is required")
            @DecimalMin(value = "0.01", message = "Discount value must be positive")
            BigDecimal discountValue,
            
            @DecimalMin(value = "0.01", message = "Minimum order amount must be positive")
            BigDecimal minimumOrderAmount,
            
            @DecimalMin(value = "0.01", message = "Maximum discount amount must be positive")
            BigDecimal maximumDiscountAmount,
            
            @NotNull(message = "Start date is required")
            LocalDateTime startDate,
            
            @NotNull(message = "End date is required")
            LocalDateTime endDate,
            
            @Min(value = 1, message = "Maximum uses must be positive")
            Integer maxUses,
            
            @Min(value = 1, message = "Maximum uses per user must be positive")
            Integer maxUsesPerUser,
            
            @NotNull(message = "Active status is required")
            Boolean isActive,
            
            UUID categoryId,
            
            UUID productId
    ) {}
    
    public record CouponResponse(
            UUID couponId,
            String code,
            String description,
            Coupon.DiscountType discountType,
            BigDecimal discountValue,
            BigDecimal minimumOrderAmount,
            BigDecimal maximumDiscountAmount,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Integer maxUses,
            Integer maxUsesPerUser,
            Integer currentUses,
            Boolean isActive,
            String categoryName,
            String productName,
            LocalDateTime createdAt,
            Boolean isValid
    ) {}
    
    public record CouponValidationRequest(
            @NotBlank(message = "Coupon code is required")
            String code,
            
            @NotNull(message = "Order amount is required")
            @DecimalMin(value = "0.01", message = "Order amount must be positive")
            BigDecimal orderAmount,
            
            @NotNull(message = "User ID is required")
            UUID userId
    ) {}
    
    public record CouponValidationResponse(
            boolean valid,
            String message,
            BigDecimal discountAmount
    ) {}
    
    public record CouponUsageResponse(
            UUID usageId,
            String couponCode,
            String userName,
            UUID orderId,
            BigDecimal discountAmount,
            LocalDateTime usedAt
    ) {}
} 