package com.zerox.csm.service;

import com.zerox.csm.dto.UserManagementDto;
import com.zerox.csm.dto.UserManagementDto.*;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.exception.ValidationException;
import com.zerox.csm.model.User;
import com.zerox.csm.model.UserRole;
import com.zerox.csm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get all users with pagination
     */
    public Page<UserSummaryResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::mapToUserSummaryResponse);
    }

    /**
     * Get user by ID
     */
    public UserSummaryResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserSummaryResponse(user);
    }

    /**
     * Update user role
     */
    @Transactional
    public UserSummaryResponse updateUserRole(UUID userId, UserUpdateRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if trying to change the last ADMIN
        if (user.getRole() == UserRole.ADMIN && request.role() != UserRole.ADMIN) {
            long adminCount = userRepository.countByRole(UserRole.ADMIN);

            if (adminCount <= 1) {
                throw new ValidationException("Cannot change the role of the last admin user");
            }
        }

        user.setRole(request.role());
        User savedUser = userRepository.save(user);
        return mapToUserSummaryResponse(savedUser);
    }

    /**
     * Update user email
     */
    @Transactional
    public UserSummaryResponse updateUserEmail(UUID userId, UserUpdateEmailRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if email is already in use
        if (userRepository.findByEmailIncludeDeleted(request.email()).isPresent() &&
                !user.getEmail().equals(request.email())) {
            throw new ValidationException("Email is already in use");
        }

        user.setEmail(request.email());
        User savedUser = userRepository.save(user);
        return mapToUserSummaryResponse(savedUser);
    }

    /**
     * Update user password
     */
    @Transactional
    public UserSummaryResponse updateUserPassword(UUID userId, UserUpdatePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validatePasswordStrength(request.password());

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        User savedUser = userRepository.save(user);
        return mapToUserSummaryResponse(savedUser);
    }

    /**
     * Update user active status (soft delete/restore)
     */
    @Transactional
    public UserSummaryResponse updateUserStatus(UUID userId, UserUpdateStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if trying to deactivate the last ADMIN
        if (user.getRole() == UserRole.ADMIN && !request.active()) {
            long adminCount = userRepository.countByRole(UserRole.ADMIN);

            if (adminCount <= 1) {
                throw new ValidationException("Cannot deactivate the last admin user");
            }
        }

        if (!request.active()) {
            userRepository.softDelete(userId);
            // Need to fetch again since it's now soft deleted
            user = userRepository.findByEmailIncludeDeleted(user.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } else if (user.isDeleted()) {
            // Restore user
            user.setDeleted(false);
            user = userRepository.save(user);
        }

        return mapToUserSummaryResponse(user);
    }

    /**
     * Hard delete a user (only for admins)
     */
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if trying to delete the last ADMIN
        if (user.getRole() == UserRole.ADMIN) {
            long adminCount = userRepository.countByRole(UserRole.ADMIN);

            if (adminCount <= 1) {
                throw new ValidationException("Cannot delete the last admin user");
            }
        }

        userRepository.delete(user);
    }

    /**
     * Get user statistics
     */
    public UserStatsResponse getUserStats() {
        long totalUsers = userRepository.count();
        long adminCount = userRepository.countByRole(UserRole.ADMIN);
        long techCount = userRepository.countByRole(UserRole.TECHNICIAN);
        long customerCount = userRepository.countByRole(UserRole.CUSTOMER);

        return new UserStatsResponse(
                totalUsers,
                totalUsers, // Active users (since we're filtering out soft-deleted)
                customerCount,
                techCount,
                adminCount
        );
    }

    // Helper methods
    private UserSummaryResponse mapToUserSummaryResponse(User user) {
        return new UserSummaryResponse(
                user.getUserId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt(),
                user.getLastLogin(),
                user.getLoyaltyPoints(),
                !user.isDeleted()
        );
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 8) {
            throw new ValidationException("Password must be at least 8 characters long");
        }

        boolean hasLetter = false;
        boolean hasDigit = false;

        for (char c : password.toCharArray()) {
            if (Character.isLetter(c)) {
                hasLetter = true;
            } else if (Character.isDigit(c)) {
                hasDigit = true;
            }

            if (hasLetter && hasDigit) {
                break;
            }
        }

        if (!hasLetter || !hasDigit) {
            throw new ValidationException("Password must contain at least one letter and one number");
        }
    }
}
