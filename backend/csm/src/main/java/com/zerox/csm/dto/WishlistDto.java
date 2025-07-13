package com.zerox.csm.dto;

import com.zerox.csm.model.Product;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class WishlistDto {
    
    public record WishlistItemRequest(
            UUID productId
    ) {}
    
    @Builder
    public record WishlistItemResponse(
            UUID wishlistItemId,
            UUID productId,
            String productName,
            String productImageUrl,
            BigDecimal productPrice,
            LocalDateTime addedAt
    ) {
        public static WishlistItemResponse fromWishlistItem(com.zerox.csm.model.WishlistItem item) {
            Product product = item.getProduct();
            return WishlistItemResponse.builder()
                    .wishlistItemId(item.getWishlistItemId())
                    .productId(product.getProductId())
                    .productName(product.getName())
                    .productImageUrl(product.getImageUrl())
                    .productPrice(product.getPrice())
                    .addedAt(item.getAddedAt())
                    .build();
        }
    }
}
