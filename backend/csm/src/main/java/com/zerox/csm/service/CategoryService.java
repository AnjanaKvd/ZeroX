package com.zerox.csm.service;

import com.zerox.csm.dto.CategoryDto.CategoryRequest;
import com.zerox.csm.dto.CategoryDto.CategoryResponse;
import com.zerox.csm.dto.CategoryDto.CategoryBriefResponse;
import com.zerox.csm.dto.CategoryDto.ProductInCategoryResponse;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.Category;
import com.zerox.csm.model.Product;
import com.zerox.csm.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getSidebarCategories() {
        return categoryRepository.findBySidebarTrue().stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        return mapToCategoryResponse(category);
    }

    public List<ProductInCategoryResponse> getCategoryProducts(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        return category.getProducts().stream()
                .map(this::mapToProductInCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category parentCategory = null;
        
        if (request.parentCategoryId() != null) {
            parentCategory = categoryRepository.findById(request.parentCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
        }
        
        // Generate slug if not provided
        String slug = request.slug();
        if (slug == null || slug.isBlank()) {
            slug = generateSlug(request.name());
        }
        
        Category category = Category.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .icon(request.icon())
                .sidebar(request.sidebar() != null ? request.sidebar() : false)
                .parentCategory(parentCategory)
                .subCategories(new ArrayList<>())
                .products(new ArrayList<>())
                .build();
        
        return mapToCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(UUID categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        // Check if new parent category is different
        if (request.parentCategoryId() != null && 
                (category.getParentCategory() == null || 
                !category.getParentCategory().getCategoryId().equals(request.parentCategoryId()))) {
            
            // Prevent circular references (category can't be its own parent)
            if (request.parentCategoryId().equals(categoryId)) {
                throw new IllegalArgumentException("Category cannot be its own parent");
            }
            
            Category parentCategory = categoryRepository.findById(request.parentCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            
            // Ensure no circular references in hierarchy
            validateNoCyclicReference(parentCategory, categoryId);
            
            category.setParentCategory(parentCategory);
        } else if (request.parentCategoryId() == null && category.getParentCategory() != null) {
            // Remove parent reference if null is passed
            category.setParentCategory(null);
        }
        
        category.setName(request.name());
        
        // Update slug if provided
        if (request.slug() != null && !request.slug().isBlank()) {
            category.setSlug(request.slug());
        } else if (!request.name().equals(category.getName())) {
            // Generate new slug if name has changed and no new slug provided
            category.setSlug(generateSlug(request.name()));
        }
        
        category.setDescription(request.description());
        category.setIcon(request.icon());
        
        // Update sidebar if provided
        if (request.sidebar() != null) {
            category.setSidebar(request.sidebar());
        }

        return mapToCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategorySidebar(UUID categoryId, Boolean sidebar) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setSidebar(sidebar);
        return mapToCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        if (!category.getProducts().isEmpty()) {
            throw new IllegalStateException("Cannot delete category with existing products");
        }
        
        // Move subcategories to parent category if any
        if (category.getParentCategory() != null && !category.getSubCategories().isEmpty()) {
            Category parentCategory = category.getParentCategory();
            for (Category subCategory : category.getSubCategories()) {
                subCategory.setParentCategory(parentCategory);
                categoryRepository.save(subCategory);
            }
        }
        
        categoryRepository.delete(category);
    }

    // Helper method to validate no cyclic reference in category hierarchy
    private void validateNoCyclicReference(Category category, UUID potentialChildId) {
        if (category == null) return;
        
        if (category.getCategoryId().equals(potentialChildId)) {
            throw new IllegalArgumentException("Circular category reference detected");
        }
        
        if (category.getParentCategory() != null) {
            validateNoCyclicReference(category.getParentCategory(), potentialChildId);
        }
    }
    
    // Helper method to generate a slug from name
    private String generateSlug(String name) {
        if (name == null || name.isBlank()) {
            return UUID.randomUUID().toString();
        }
        
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "") // Remove all non-alphanumeric characters except spaces and hyphens
                .replaceAll("\\s+", "-")         // Replace spaces with hyphens
                .replaceAll("-+", "-")           // Replace multiple hyphens with single hyphen
                .trim();
    }

    // Mapping methods
    private CategoryResponse mapToCategoryResponse(Category category) {
        return new CategoryResponse(
                category.getCategoryId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getIcon(),
                category.getSidebar(),
                category.getParentCategory() != null ? category.getParentCategory().getCategoryId() : null,
                category.getParentCategory() != null ? category.getParentCategory().getName() : null,
                category.getSubCategories().stream()
                        .map(sub -> new CategoryBriefResponse(
                                sub.getCategoryId(), 
                                sub.getName(), 
                                sub.getSlug(),
                                sub.getIcon()))
                        .collect(Collectors.toList()),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
    
    private ProductInCategoryResponse mapToProductInCategoryResponse(Product product) {
        return new ProductInCategoryResponse(
                product.getProductId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getBrand(),
                product.getStockQuantity()
        );
    }
} 