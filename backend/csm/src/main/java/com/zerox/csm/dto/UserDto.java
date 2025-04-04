package com.zerox.csm.dto;

import com.zerox.csm.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserDto {
    private UUID userId;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private int loyaltyPoints;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private boolean isDeleted;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public int getLoyaltyPoints() {
        return loyaltyPoints;
    }

    public void setLoyaltyPoints(int loyaltyPoints) {
        this.loyaltyPoints = loyaltyPoints;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public record UserUpdateRequest(
            @NotBlank String fullName,
            @NotBlank @Email String email,
            @NotBlank String phone,
            UUID userId
    ) {

        public UUID getUserId() {
            return userId;
        }

        public String getEmail() {
            return email;
        }

        public String getFullName() {
            return fullName;
        }

        public String getPhone() {
            return phone;
        }
    }

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
            @NotBlank(message = "Current password cannot be blank")
            String currentPassword,

            @NotBlank(message = "New password cannot be blank")
            @Size(min = 8, max = 100, message = "Password must be 8-100 characters")
            String newPassword,

            @NotBlank(message = "Confirmation password cannot be blank")
            String confirmPassword
    ) {
        public boolean passwordsMatch() {
            return newPassword.equals(confirmPassword);
        }
    }

} 