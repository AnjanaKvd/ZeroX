package com.zerox.csm.repository;

import com.zerox.csm.model.Order;
import com.zerox.csm.model.Product;
import com.zerox.csm.model.Review;
import com.zerox.csm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByProductProductId(UUID productId, Pageable pageable);

    List<Review> findByUserUserId(UUID userId);

    boolean existsByUserAndProduct(User user, Product product);


    //    Double findAverageRatingByProductProductId(UUID productId);
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId")
    Double getAverageRating(UUID productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.productId = :productId")
    int getReviewCount(UUID productId);
    
    @Modifying
    @Query("DELETE FROM Review r WHERE r.user.userId = :userId")
    int deleteByUserUserId(@Param("userId") UUID userId);
}

