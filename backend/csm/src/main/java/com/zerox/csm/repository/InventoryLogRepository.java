package com.zerox.csm.repository;

import com.zerox.csm.model.InventoryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, UUID> {

    @Query("SELECT il FROM InventoryLog il WHERE " +
            "il.product.productId = :productId AND " +
            "il.timestamp BETWEEN :start AND :end")
    List<InventoryLog> findProductHistory(
            @Param("productId") UUID productId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
    
    Page<InventoryLog> findByProductProductId(UUID productId, Pageable pageable);
    
    Page<InventoryLog> findByProductProductIdAndTimestampBetween(
            UUID productId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );
}
