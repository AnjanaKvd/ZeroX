package com.zerox.csm.service;

import com.zerox.csm.dto.InventoryLogDto;
import com.zerox.csm.dto.ProductDto;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.*;
import com.zerox.csm.repository.CategoryRepository;
import com.zerox.csm.repository.InventoryLogRepository;
import com.zerox.csm.repository.ProductRepository;
import com.zerox.csm.repository.StockAlertRepository;
import com.zerox.csm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

// ProductService.java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final StockAlertRepository stockAlertRepository;
    private final UserRepository userRepository;

    // Create a new product
    @Transactional
    public ProductDto.ProductResponse createProduct(ProductDto.ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Handle image upload
        String imageUrl = null;
        if (request.image() != null && !request.image().isEmpty()) {
            imageUrl = imageStorageService.storeImage(request.image());
        }

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .category(category)
                .sku(request.sku())
                .brand(request.brand())
                .stockQuantity(request.stockQuantity())
                .lowStockThreshold(request.lowStockThreshold())
                .warrantyPeriodMonths(request.warrantyPeriodMonths())
                .imageUrl(imageUrl)
                .createdAt(LocalDateTime.now())
                .build();
        
        Product savedProduct = productRepository.save(product);
        
        // Log initial inventory if there is stock
        if (request.stockQuantity() > 0) {
            logInventoryChange(
                savedProduct,
                0,
                request.stockQuantity(),
                null, // No specific user for initial inventory
                InventoryLog.InventoryChangeType.RESTOCK
            );
        }
        
        // Check if stock is below threshold
        checkLowStockLevel(savedProduct);
        
        return mapToProductResponse(savedProduct);
    }
    
    // Get product by ID
    public ProductDto.ProductResponse getProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        return mapToProductResponse(product);
    }
    
    // Get product by SKU
    public ProductDto.ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        return mapToProductResponse(product);
    }
    
    // Update product
    @Transactional
    public ProductDto.ProductResponse updateProduct(UUID productId, ProductDto.ProductRequest request, UUID userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Handle image update
        if (request.image() != null && !request.image().isEmpty()) {
            // Delete old image if exists
            if (product.getImageUrl() != null) {
                imageStorageService.deleteImage(product.getImageUrl());
            }
            // Store new image
            String newImageUrl = imageStorageService.storeImage(request.image());
            product.setImageUrl(newImageUrl);
        }
        
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        User changedBy = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if stock quantity changed and log it
        int oldStock = product.getStockQuantity();
        if (oldStock != request.stockQuantity()) {
            logInventoryChange(
                product,
                oldStock,
                request.stockQuantity(),
                changedBy,
                InventoryLog.InventoryChangeType.ADJUSTMENT
            );
        }
        
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCategory(category);
        product.setSku(request.sku());
        product.setBrand(request.brand());
        product.setStockQuantity(request.stockQuantity());
        product.setLowStockThreshold(request.lowStockThreshold());
        product.setWarrantyPeriodMonths(request.warrantyPeriodMonths());
        
        Product updatedProduct = productRepository.save(product);
        
        // Check if stock is below threshold
        checkLowStockLevel(updatedProduct);
        
        return mapToProductResponse(updatedProduct);
    }
    
    // Delete product
    @Transactional
    public void deleteProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Delete associated image if exists
        if (product.getImageUrl() != null) {
            imageStorageService.deleteImage(product.getImageUrl());
        }
        
        productRepository.deleteById(productId);
    }
    
    // Search products with filters
    public Page<ProductDto.ProductResponse> searchProducts(
            String query,
            UUID categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String brand,
            String sortBy,
            String sortDirection,
            int page,
            int size
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection == null || sortDirection.equalsIgnoreCase("asc") ? "ASC" : "DESC"), 
                sortBy == null ? "name" : sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> products;
        if (query != null && !query.trim().isEmpty()) {
            products = productRepository.searchProductsByQuery(query, categoryId, minPrice, maxPrice, brand, pageable);
        } else {
            products = productRepository.searchProducts(categoryId, minPrice, maxPrice, brand, pageable);
        }
        
        return products.map(this::mapToProductResponse);
    }
    
    // Update stock quantity
    @Transactional
    public ProductDto.ProductResponse updateStock(ProductDto.StockUpdateRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        User changedBy = null;
        if (request.changedById() != null) {
            changedBy = userRepository.findById(request.changedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        
        int oldStock = product.getStockQuantity();
        int newStock = oldStock + request.quantityChange();
        
        if (newStock < 0) {
            throw new IllegalArgumentException("Cannot reduce stock below zero");
        }
        
        product.setStockQuantity(newStock);
        Product updatedProduct = productRepository.save(product);
        
        // Determine change type based on whether it's an increase or decrease
        InventoryLog.InventoryChangeType changeType = request.quantityChange() > 0 ? 
                InventoryLog.InventoryChangeType.RESTOCK : InventoryLog.InventoryChangeType.SALE;
        
        // Log inventory change
        logInventoryChange(
            product,
            oldStock,
            newStock,
            changedBy,
            changeType
        );
        
        // MySQL trigger will handle stock alerts automatically
        // We can create one manually too if not using the trigger
        if (newStock <= product.getLowStockThreshold()) {
            StockAlert alert = StockAlert.builder()
                    .product(product)
                    .currentStock(newStock)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            stockAlertRepository.save(alert);
        }
        
        return mapToProductResponse(updatedProduct);
    }
    
    // Get inventory logs for a product
    public Page<InventoryLogDto.InventoryLogResponse> getProductInventoryLogs(
            UUID productId, 
            LocalDateTime startDate,
            LocalDateTime endDate,
            int page,
            int size
    ) {
        // Verify product exists
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        
        // If dates not provided, fetch all logs
        Page<InventoryLog> logs;
        if (startDate != null && endDate != null) {
            logs = inventoryLogRepository.findByProductProductIdAndTimestampBetween(
                productId, startDate, endDate, pageable);
        } else {
            logs = inventoryLogRepository.findByProductProductId(productId, pageable);
        }
        
        return logs.map(log -> new InventoryLogDto.InventoryLogResponse(
            log.getLogId(),
            log.getProduct().getProductId(),
            log.getProduct().getName(),
            log.getOldQuantity(),
            log.getNewQuantity(),
            log.getChangeType(),
            log.getChangedBy() != null ? log.getChangedBy().getFullName() : "System",
            log.getTimestamp()
        ));
    }
    
    // Helper methods
    private void logInventoryChange(
            Product product, 
            int oldQuantity, 
            int newQuantity,
            User changedBy,
            InventoryLog.InventoryChangeType changeType
    ) {
        InventoryLog log = InventoryLog.builder()
                .product(product)
                .oldQuantity(oldQuantity)
                .newQuantity(newQuantity)
                .changeType(changeType)
                .changedBy(changedBy)
                .timestamp(LocalDateTime.now())
                .build();
        
        inventoryLogRepository.save(log);
    }
    
    private void checkLowStockLevel(Product product) {
        if (product.getStockQuantity() <= product.getLowStockThreshold()) {
            // Instead of checking for unresolved alerts, create a new alert
            // The trigger in database will handle this in MySQL
            StockAlert alert = StockAlert.builder()
                    .product(product)
                    .currentStock(product.getStockQuantity())
                    .createdAt(LocalDateTime.now())
                    .build();
            
            stockAlertRepository.save(alert);
        }
    }
    
    private ProductDto.ProductResponse mapToProductResponse(Product product) {
        return new ProductDto.ProductResponse(
                product.getProductId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory().getName(),
                product.getSku(),
                product.getBrand(),
                product.getStockQuantity(),
                product.getLowStockThreshold(),
                product.getWarrantyPeriodMonths(),
                product.getImageUrl(),
                product.getCreatedAt()
        );
    }
}