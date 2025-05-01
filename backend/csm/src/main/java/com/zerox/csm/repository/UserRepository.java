package com.zerox.csm.repository;

import com.zerox.csm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(UUID userId);

    // For finding users including deleted ones (not exposed to controllers)
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailIncludeDeleted(@Param("email") String email);

    // Soft delete of user
    @Modifying
    @Query("UPDATE User u SET u.isDeleted = true WHERE u.userId = :userId")
    void softDelete(@Param("userId") UUID userId);

    //counting email of a user
    @Query("SELECT COUNT(u) FROM User u WHERE u.email = :email")
    int countByEmail(@Param("email") String email);

}