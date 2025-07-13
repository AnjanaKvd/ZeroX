package com.zerox.csm.repository;

import com.zerox.csm.model.User;
import com.zerox.csm.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);
    Optional<User> findById(UUID userId);

    // Include deleted users
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailIncludeDeleted(@Param("email") String email);
    
    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findByIdIncludeDeleted(@Param("userId") UUID userId);

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

    // Restore a soft-deleted user
    @Modifying
    @Query("UPDATE User u SET u.isDeleted = false WHERE u.userId = :userId")
    void restoreUser(@Param("userId") UUID userId);

    //counting email of a user
    @Query("SELECT COUNT(u) FROM User u WHERE u.email = :email")
    int countByEmail(@Param("email") String email);

    // Find users by role
    @Query("SELECT u FROM User u WHERE u.role = :role")
    List<User> findByRole(@Param("role") UserRole role);

    // Find all users including deleted ones
    @Query("SELECT u FROM User u")
    List<User> findAllIncludingDeleted();

    // Count users by role
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") UserRole role);
    
    // Hard delete a user (bypasses soft delete)
    @Modifying
    @Query(value = "DELETE FROM users WHERE user_id = :userId", nativeQuery = true)
    void hardDelete(@Param("userId") UUID userId);

    // Count only active accounts by email
    @Query("SELECT COUNT(u) FROM User u WHERE u.email = :email AND u.isDeleted = false")
    int countActiveEmail(@Param("email") String email);
}
