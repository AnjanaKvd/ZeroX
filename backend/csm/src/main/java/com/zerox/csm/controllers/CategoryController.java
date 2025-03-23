package com.zerox.csm.controllers;

import com.zerox.csm.dto.CategoryDto;
import com.zerox.csm.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<CategoryDto.CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
    
    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryDto.CategoryResponse> getCategory(
            @PathVariable UUID categoryId
    ) {
        return ResponseEntity.ok(categoryService.getCategory(categoryId));
    }
    
    @GetMapping("/{categoryId}/products")
    public ResponseEntity<List<CategoryDto.ProductInCategoryResponse>> getCategoryProducts(
            @PathVariable UUID categoryId
    ) {
        return ResponseEntity.ok(categoryService.getCategoryProducts(categoryId));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDto.CategoryResponse> createCategory(
            @Valid @RequestBody CategoryDto.CategoryRequest request
    ) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }
    
    @PutMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDto.CategoryResponse> updateCategory(
            @PathVariable UUID categoryId,
            @Valid @RequestBody CategoryDto.CategoryRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateCategory(categoryId, request));
    }
    
    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }
} 