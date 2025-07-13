package com.zerox.csm.repository;

import com.zerox.csm.model.Order;
import com.zerox.csm.model.OrderStatus;
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
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUserUserId(UUID userId, Pageable pageable);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    List<Order> findByUserUserIdAndStatus(UUID userId, OrderStatus status);
    
    @Modifying
    @Query("DELETE FROM Order o WHERE o.user.userId = :userId")
    int deleteByUserUserId(@Param("userId") UUID userId);
} 