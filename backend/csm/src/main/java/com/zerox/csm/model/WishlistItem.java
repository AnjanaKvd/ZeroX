package com.zerox.csm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wishlist_items",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItem {
    
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "wishlist_id")
    private UUID wishlistItemId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    // Explicit getter for addedAt to ensure it's available
    public LocalDateTime getAddedAt() {
        return addedAt;
    }
    
    @PreRemove
    private void removeFromUserAndProduct() {
        if (user != null) {
            user.getWishlistItems().remove(this);
        }
        if (product != null) {
            product.getWishlistItems().remove(this);
        }
    }
}
