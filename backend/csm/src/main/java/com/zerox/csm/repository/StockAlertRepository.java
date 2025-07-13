package com.zerox.csm.repository;

import com.zerox.csm.model.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockAlertRepository extends JpaRepository<StockAlert, UUID> {
    void deleteByProductProductId(UUID productId);
    
    List<StockAlert> findByProductProductId(UUID productId);
    
    List<StockAlert> findTop10ByOrderByCreatedAtDesc();
} 