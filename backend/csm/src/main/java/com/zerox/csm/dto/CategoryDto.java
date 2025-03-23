package com.zerox.csm.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CategoryDto {
    
    public record CategoryRequest(
            @NotBlank String name,
            UUID parentCategoryId
    ) {}
    
    public record CategoryResponse(
            UUID categoryId,
            String name,
            UUID parentCategoryId,
            String parentCategoryName,
            List<CategoryBriefResponse> subCategories
    ) {}
    
    public record CategoryBriefResponse(
            UUID categoryId,
            String name
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