package com.zerox.csm.repository;

import com.zerox.csm.model.Shipping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShippingRepository extends JpaRepository<Shipping, UUID> {
    Optional<Shipping> findByOrderOrderId(UUID orderId);
    
    Optional<Shipping> findByTrackingNumber(String trackingNumber);
} 