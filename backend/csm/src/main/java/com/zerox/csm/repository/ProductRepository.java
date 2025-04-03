package com.zerox.csm.repository;

import com.zerox.csm.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

// src/main/java/com/zerox/csm/repository/ProductRepository.java
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Optional<Product> findBySku(String sku);
    
    @Query("SELECT p FROM Product p WHERE " +
            "(:category IS NULL OR p.category.categoryId = :category) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:brand IS NULL OR p.brand = :brand)")
    Page<Product> searchProducts(
            @Param("category") UUID category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("brand") String brand,
            @Param("keywords") String keywords,
            Pageable pageable
    );
    
    @Query("SELECT p FROM Product p WHERE " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "(:category IS NULL OR p.category.categoryId = :category) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
            "(:brand IS NULL OR p.brand = :brand)")
    Page<Product> searchProductsByQuery(
            @Param("query") String query,
            @Param("category") UUID category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("brand") String brand,
            @Param("keywords") String keywords,
            Pageable pageable
    );
}
