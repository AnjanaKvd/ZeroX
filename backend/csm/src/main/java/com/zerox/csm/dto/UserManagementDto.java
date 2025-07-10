package com.zerox.csm.dto;

import com.zerox.csm.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserManagementDto {

    public record UserSummaryResponse(
            UUID userId,
            String email,
            String fullName,
            String phone,
            UserRole role,
            LocalDateTime createdAt,
            LocalDateTime lastLogin,
            Integer loyaltyPoints,
            boolean isActive
    ) {}

    public record UserUpdateRoleRequest(
            @NotNull(message = "Role is required")
            UserRole role
    ) {}

    public record UserUpdateEmailRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email
    ) {}

    public record UserUpdatePasswordRequest(
            @NotBlank(message = "Password is required")
            @Size(min = 8, message = "Password must be at least 8 characters")
            String password
    ) {}

    public record UserUpdateStatusRequest(
            @NotNull(message = "Active status is required")
            boolean active
    ) {}

    public record UserStatsResponse(
            long totalUsers,
            long activeUsers,
            long customersCount,
            long techniciansCount,
            long adminsCount
    ) {}
}
