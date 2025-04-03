package com.zerox.csm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

// Product.java
@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "sku", nullable = false, unique = true)
    private String sku;
    
    @Column(name = "brand")
    private String brand;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;
    
    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;
    
    @Column(name = "barcode", unique = true)
    private String barcode;
    
    @Column(name = "warranty_period_months")
    private Integer warrantyPeriodMonths;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "keywords")
    private String keywords;

}
