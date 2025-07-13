package com.zerox.csm.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CategoryDto {
    
    public record CategoryRequest(
            @NotBlank String name,
            String slug,
            String description,
            String icon,
            UUID parentCategoryId,
            Boolean sidebar
    ) {}
    
    public record CategoryResponse(
            UUID categoryId,
            String name,
            String slug,
            String description,
            String icon,
            Boolean sidebar,
            UUID parentCategoryId,
            String parentCategoryName,
            List<CategoryBriefResponse> subCategories,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}
    
    public record CategoryBriefResponse(
            UUID categoryId,
            String name,
            String slug,
            String icon
    ) {}
    
    public record ProductInCategoryResponse(
            UUID productId,
            String name,
            String description,
            BigDecimal price,
            String brand,
            int stockQuantity
    ) {}
} 