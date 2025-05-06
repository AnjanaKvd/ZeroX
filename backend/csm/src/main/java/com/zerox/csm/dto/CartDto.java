package com.zerox.csm.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CartDto {

    @Data
    public static class CartItemRequest {
        private UUID productId;
        private int quantity;
    }

    @Data
    public static class CartResponse {
        private UUID cartId;
        private List<CartItemResponse> items;
        private BigDecimal totalPrice;
    }

    @Data
    public static class CartItemResponse {
        private UUID productId;
        private String productName;
        private int quantity;
        private BigDecimal price;
    }
}
