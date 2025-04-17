package com.zerox.csm.repository;

import com.zerox.csm.model.ProductDiscount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductDiscountRepository extends JpaRepository<ProductDiscount, UUID> {
    
    @Query("SELECT pd FROM ProductDiscount pd WHERE pd.product.productId = :productId AND pd.active = true AND " +
           "pd.startDate <= :now AND pd.endDate >= :now ORDER BY pd.discountPrice ASC")
    Optional<ProductDiscount> findActiveDiscountForProduct(@Param("productId") UUID productId, @Param("now") LocalDateTime now);
    
    @Query("SELECT pd FROM ProductDiscount pd WHERE pd.active = true AND " +
           "pd.startDate <= :now AND pd.endDate >= :now ORDER BY pd.product.name ASC")
    List<ProductDiscount> findAllActiveDiscounts(@Param("now") LocalDateTime now);

    @Query("SELECT pd FROM ProductDiscount pd WHERE pd.active = true AND " +
           "pd.startDate <= :now AND pd.endDate >= :now")
    Page<ProductDiscount> findAllActiveDiscounts(@Param("now") LocalDateTime now, Pageable pageable);
    
    List<ProductDiscount> findByProductProductIdAndActiveTrue(UUID productId);
    
    @Query("SELECT pd FROM ProductDiscount pd WHERE pd.product.productId = :productId AND pd.active = true AND " +
           "((pd.startDate <= :endDate AND pd.endDate >= :startDate))")
    List<ProductDiscount> findOverlappingDiscounts(
            @Param("productId") UUID productId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
} 