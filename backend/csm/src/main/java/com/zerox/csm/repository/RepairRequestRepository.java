package com.zerox.csm.repository;

import com.zerox.csm.model.RepairRequest;
import com.zerox.csm.model.RepairRequest.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, UUID> {
    List<RepairRequest> findByUserUserIdOrderByCreatedAtDesc(UUID userId);
    
    Page<RepairRequest> findByStatus(Status status, Pageable pageable);
    
    List<RepairRequest> findByStatusOrderByCreatedAtAsc(Status status);
} 