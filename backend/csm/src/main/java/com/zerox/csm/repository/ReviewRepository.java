package com.zerox.csm.repository;

import com.zerox.csm.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByProductProductId(UUID productId, Pageable pageable);
    
    List<Review> findByUserUserId(UUID userId);
    
    Double findAverageRatingByProductProductId(UUID productId);
} 