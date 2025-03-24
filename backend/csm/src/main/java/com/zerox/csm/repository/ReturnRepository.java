package com.zerox.csm.repository;

import com.zerox.csm.model.Return;
import com.zerox.csm.model.Return.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReturnRepository extends JpaRepository<Return, UUID> {
    List<Return> findByOrderOrderId(UUID orderId);
    
    List<Return> findByStatus(Status status);
    
    List<Return> findByOrderUserUserId(UUID userId);
} 