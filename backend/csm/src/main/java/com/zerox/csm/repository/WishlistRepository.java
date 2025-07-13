package com.zerox.csm.repository;

import com.zerox.csm.model.Product;
import com.zerox.csm.model.User;
import com.zerox.csm.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, UUID> {

    List<WishlistItem> findByUser_UserIdOrderByAddedAtDesc(UUID userId);
    
    boolean existsByUser_UserIdAndProduct_ProductId(UUID userId, UUID productId);
    
    Optional<WishlistItem> findByUser_UserIdAndProduct_ProductId(UUID userId, UUID productId);
    
    @Query("SELECT w.product FROM WishlistItem w WHERE w.user.userId = :userId")
    List<Product> findWishlistProductsByUserId(@Param("userId") UUID userId);
    
    void deleteByUser_UserIdAndProduct_ProductId(UUID userId, UUID productId);
    
    void deleteByUser_UserId(UUID userId);
}
