package com.zerox.csm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
    
@Column(name = "active", nullable = false, columnDefinition = "boolean default true")
private Boolean active = true;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "warranty_period_months")
    private Integer warrantyPeriodMonths;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name ="keywords")
    private String keywords;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WishlistItem> wishlistItems = new ArrayList<>();
    
    // Helper methods for wishlist
    public void addToWishlist(WishlistItem item) {
        wishlistItems.add(item);
        item.setProduct(this);
    }
    
    public void removeFromWishlist(WishlistItem item) {
        wishlistItems.remove(item);
        item.setProduct(null);
    }
}
