package com.zerox.csm.controllers;

import com.zerox.csm.dto.UserManagementDto;
import com.zerox.csm.dto.UserManagementDto.*;
import com.zerox.csm.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    /**
     * Get all users with pagination
     */
    @GetMapping
    public ResponseEntity<Page<UserSummaryResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(userManagementService.getAllUsers(PageRequest.of(page, size)));
    }

    /**
     * Get user statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<UserStatsResponse> getUserStats() {
        return ResponseEntity.ok(userManagementService.getUserStats());
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserSummaryResponse> getUserById(
            @PathVariable UUID userId
    ) {
        return ResponseEntity.ok(userManagementService.getUserById(userId));
    }

    /**
     * Update user role
     */
    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserSummaryResponse> updateUserRole(
            @PathVariable UUID userId,
            @Valid @RequestBody UserUpdateRoleRequest request
    ) {
        return ResponseEntity.ok(userManagementService.updateUserRole(userId, request));
    }

    /**
     * Update user email
     */
    @PatchMapping("/{userId}/email")
    public ResponseEntity<UserSummaryResponse> updateUserEmail(
            @PathVariable UUID userId,
            @Valid @RequestBody UserUpdateEmailRequest request
    ) {
        return ResponseEntity.ok(userManagementService.updateUserEmail(userId, request));
    }

    /**
     * Update user password
     */
    @PatchMapping("/{userId}/password")
    public ResponseEntity<UserSummaryResponse> updateUserPassword(
            @PathVariable UUID userId,
            @Valid @RequestBody UserUpdatePasswordRequest request
    ) {
        return ResponseEntity.ok(userManagementService.updateUserPassword(userId, request));
    }

    /**
     * Update user status (activate/deactivate)
     */
    @PatchMapping("/{userId}/status")
    public ResponseEntity<UserSummaryResponse> updateUserStatus(
            @PathVariable UUID userId,
            @Valid @RequestBody UserUpdateStatusRequest request
    ) {
        return ResponseEntity.ok(userManagementService.updateUserStatus(userId, request));
    }

    /**
     * Hard delete a user
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID userId
    ) {
        userManagementService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
