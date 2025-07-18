package com.zerox.csm.controllers;

import com.zerox.csm.dto.InventoryLogDto;
import com.zerox.csm.dto.ProductDto;
import com.zerox.csm.service.ImageStorageService;
import com.zerox.csm.service.ProductArchiveService;
import com.zerox.csm.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

// src/main/java/com/zerox/csm/controller/ProductController.java
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final ProductArchiveService productArchiveService;
    private final ImageStorageService imageStorageService;

    @GetMapping
    public ResponseEntity<Page<ProductDto.ProductResponse>> searchProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(productService.searchProducts(
                query, categoryId, minPrice, maxPrice, brand, sortBy, sortDirection, page, size
        ));
    }
    
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDto.ProductResponse> getProductById(@PathVariable UUID productId) {
        return ResponseEntity.ok(productService.getProduct(productId));
    }
    
    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductDto.ProductResponse> getProductBySku(@PathVariable String sku) {
        return ResponseEntity.ok(productService.getProductBySku(sku));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto.ProductResponse> createProduct(
            @Valid @ModelAttribute ProductDto.ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(request));
    }
    
    @PutMapping(value = "/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto.ProductResponse> updateProduct(
            @PathVariable UUID productId,
            @Valid @ModelAttribute ProductDto.ProductRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(productService.updateProduct(productId, request, userId));
    }
    
    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable UUID productId) {
        try {
            productService.deleteProduct(productId);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            if (e.getMessage().contains("Cannot delete product with existing inventory logs")) {
                // If we can't delete due to inventory logs, automatically archive instead
                ProductDto.ProductResponse archivedProduct = productArchiveService.archiveProduct(productId);
                return ResponseEntity
                    .status(HttpStatus.ACCEPTED)
                    .body(Map.of(
                        "message", "Product could not be deleted due to existing inventory logs. It has been archived instead.",
                        "product", archivedProduct
                    ));
            }
            throw e;
        }
    }
    
    @PostMapping("/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ProductDto.ProductResponse> updateStock(
            @Valid @RequestBody ProductDto.StockUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.updateStock(request));
    }
    
    @GetMapping("/{productId}/inventory-logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Page<InventoryLogDto.InventoryLogResponse>> getProductInventoryLogs(
            @PathVariable UUID productId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(productService.getProductInventoryLogs(
                productId, startDate, endDate, page, size
        ));
    }
    
    // Helper method to extract userId from UserDetails
    private UUID getUserId(UserDetails userDetails) {
        // This is a placeholder - you would implement this based on how your UserDetails
        // has been extended to include the userId
        return UUID.fromString("00000000-0000-0000-0000-000000000000"); 
    }
}
