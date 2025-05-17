package com.zerox.csm.service;

import com.zerox.csm.dto.AuthDto.LoginRequest;
import com.zerox.csm.dto.AuthDto.RegisterRequest;
import com.zerox.csm.dto.AuthDto.AuthResponse;
import com.zerox.csm.dto.UserDto;
import com.zerox.csm.exception.PasswordChangeException;
import com.zerox.csm.exception.ResourceNotFoundException;
import com.zerox.csm.model.User;
import com.zerox.csm.model.UserRole;
import com.zerox.csm.repository.UserRepository;
import com.zerox.csm.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findTopByEmailAndIsDeletedFalseOrderByCreatedAtDesc(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("No active account found for this email"));

        String token = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPasswordHash())
                        .authorities("ROLE_" + user.getRole().name())
                        .build()
        );

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponse(token, user.getEmail(), user.getRole().name(),
                user.getFullName(), user.getPhone(), user.getUserId());
    }

    @Transactional
    public void deleteAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isDeleted()) {
            throw new IllegalStateException("Account already deleted");
        }

        userRepository.softDelete(userId);
    }

    public AuthResponse register(RegisterRequest request) {
        Optional<User> existingActive = userRepository.findTopByEmailAndIsDeletedFalseOrderByCreatedAtDesc(request.email());
        if (existingActive.isPresent()) {
            throw new IllegalArgumentException("This email is already used for an active account.");
        }

        Optional<User> deletedUser = userRepository.findTopByEmailAndIsDeletedTrueOrderByCreatedAtDesc(request.email());
        if (deletedUser.isPresent()) {
            User user = deletedUser.get();
            user.setFullName(request.fullName());
            user.setPhone(request.phone());
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            user.setDeleted(false);
            user.setCreatedAt(LocalDateTime.now());
            userRepository.save(user);
            return generateAuthorResponseWithoutToken(user);
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .loyaltyPoints(0)
                .createdAt(LocalDateTime.now())
                .role(UserRole.CUSTOMER)
                .isDeleted(false)
                .build();

        userRepository.save(user);
        return generateAuthorResponseWithoutToken(user);
    }

    private AuthResponse generateAuthorResponseWithoutToken(User user) {
        return new AuthResponse(null, user.getEmail(), user.getRole().name(),
                user.getFullName(), user.getPhone(), user.getUserId());
    }

    private AuthResponse generateAuthorResponse(User user) {
        String jwt = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPasswordHash())
                        .authorities("ROLE_" + user.getRole().name())
                        .build()
        );

        return new AuthResponse(jwt, user.getEmail(), user.getRole().name(),
                user.getFullName(), user.getPhone(), user.getUserId());
    }

    public UserDto.UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new UserDto.UserProfileResponse(
                user.getUserId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole(),
                user.getLoyaltyPoints(),
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }

    public UserDto.UserProfileResponse updateUserProfile(String email, UserDto.UserUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        User updatedUser = userRepository.save(user);

        return new UserDto.UserProfileResponse(
                updatedUser.getUserId(),
                updatedUser.getEmail(),
                updatedUser.getFullName(),
                updatedUser.getPhone(),
                updatedUser.getRole(),
                updatedUser.getLoyaltyPoints(),
                updatedUser.getCreatedAt(),
                updatedUser.getLastLogin()
        );
    }

    public void changePassword(String email, UserDto.PasswordChangeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new PasswordChangeException("Current password is incorrect");
        }

        if (request.newPassword().length() < 8) {
            throw new PasswordChangeException("Password must be at least 8 characters");
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new PasswordChangeException("New passwords don't match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}

