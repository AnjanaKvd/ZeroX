package com.zerox.csm.repository;

import com.zerox.csm.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findByUserUserId(UUID userId);
    
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.user.userId = :userId")
    int deleteByUserUserId(@Param("userId") UUID userId);
}