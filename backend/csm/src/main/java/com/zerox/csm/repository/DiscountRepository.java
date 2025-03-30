package com.zerox.csm.repository;

import com.zerox.csm.model.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, UUID> {
    Optional<Discount> findByCode(String code);
    
    @Query("SELECT d FROM Discount d WHERE d.validFrom <= :now AND (d.validUntil IS NULL OR d.validUntil >= :now)")
    List<Discount> findActiveDiscounts(LocalDateTime now);
} 