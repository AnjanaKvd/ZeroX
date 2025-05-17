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

    // Include deleted users
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailIncludeDeleted(@Param("email") String email);

    // Active user only
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isDeleted = false")
    Optional<User> findActiveByEmail(@Param("email") String email);

    // Latest active account for login
    Optional<User> findTopByEmailAndIsDeletedFalseOrderByCreatedAtDesc(String email);

    // Latest soft-deleted account for reactivation
    Optional<User> findTopByEmailAndIsDeletedTrueOrderByCreatedAtDesc(String email);

    // Soft delete
    @Modifying
    @Query("UPDATE User u SET u.isDeleted = true WHERE u.userId = :userId")
    void softDelete(@Param("userId") UUID userId);

    // Count all accounts (active & deleted) by email
    @Query("SELECT COUNT(u) FROM User u WHERE u.email = :email")
    int countByEmail(@Param("email") String email);

    // Count only active accounts by email
    @Query("SELECT COUNT(u) FROM User u WHERE u.email = :email AND u.isDeleted = false")
    int countActiveEmail(@Param("email") String email);
}

