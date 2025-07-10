package com.zerox.csm.repository;

import com.zerox.csm.model.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, UUID> {
    List<CustomerAddress> findByUserUserId(UUID userId);
    
    @Modifying
    @Query("DELETE FROM CustomerAddress ca WHERE ca.user.userId = :userId")
    int deleteByUserUserId(@Param("userId") UUID userId);

    Optional<CustomerAddress> findByUserUserIdAndIsDefaultTrue(UUID userId);

    boolean existsByUserUserIdAndIsDefaultTrue(UUID userId);
}