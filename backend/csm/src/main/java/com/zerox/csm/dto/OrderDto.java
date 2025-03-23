package com.zerox.csm.dto;

import com.zerox.csm.model.OrderStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderDto {
    public record OrderRequest(
            @NotNull UUID userId,
            @NotEmpty List<OrderItemRequest> items,
            UUID addressId,
            String paymentMethod,
            String discountCode
    ) {}

    public record OrderItemRequest(
            @NotNull UUID productId,
            @Positive int quantity
    ) {}

    public record OrderResponse(
            UUID orderId,
            String customerEmail,
            List<OrderItemResponse> items,
            BigDecimal totalAmount,
            OrderStatus status,
            String paymentMethod,
            String paymentId,
            LocalDateTime createdAt
    ) {}

    public record OrderItemResponse(
            String productName,
            int quantity,
            BigDecimal priceAtPurchase,
            BigDecimal subtotal
    ) {}
    
    public record OrderStatusUpdateRequest(
            @NotNull OrderStatus status
    ) {}
} 