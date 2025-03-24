package com.zerox.csm.dto;

import com.zerox.csm.model.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserDto {
    
    public record UserUpdateRequest(
            @NotBlank String fullName,
            String phone
    ) {}
    
    public record UserProfileResponse(
            UUID userId,
            String email,
            String fullName,
            String phone,
            UserRole role,
            int loyaltyPoints,
            LocalDateTime createdAt,
            LocalDateTime lastLogin
    ) {}
    
    public record AdminUserResponse(
            UUID userId,
            String email,
            String fullName,
            String phone,
            UserRole role,
            int loyaltyPoints,
            LocalDateTime createdAt,
            LocalDateTime lastLogin
    ) {}
    
    public record PasswordChangeRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 6, max = 100) String newPassword
    ) {}
} 