package com.zerox.csm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

// src/main/java/com/zerox/csm/dto/ProductDto.java
public class ProductDto {
    public record ProductRequest(
            @NotBlank String name,
            @NotBlank String description,
            @Positive BigDecimal price,
            @NotNull UUID categoryId,
            @NotBlank String sku,
            String brand,
            @PositiveOrZero int stockQuantity,
            @PositiveOrZero int lowStockThreshold,
            String barcode,
            Integer warrantyPeriodMonths,
            MultipartFile image,
            String keywords
    ) {}

    public record ProductResponse(
            UUID productId,
            String name,
            String description,
            BigDecimal price,
            String categoryName,
            String sku,
            String brand,
            int stockQuantity,
            int lowStockThreshold,
            String barcode,
            Integer warrantyPeriodMonths,
            LocalDateTime createdAt,
            String imagePath,
            String keywords
    ) {}
    
    public record ProductSearchRequest(
            String query,
            UUID categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String brand,
            String sortBy,
            String sortDirection,
            String keywords
    ) {}
    
    public record StockUpdateRequest(
            @NotNull UUID productId,
            int quantityChange,
            UUID changedById
    ) {}
}
