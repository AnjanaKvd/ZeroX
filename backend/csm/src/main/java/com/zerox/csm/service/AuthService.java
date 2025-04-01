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

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );
        
        // Generate token
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        var jwt = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPasswordHash())
                        .authorities("ROLE_" + user.getRole().name())
                        .build()
        );
        
        // Update last login time
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
//        return new AuthResponse(jwt, user.getEmail(), user.getRole().name());
        return new AuthResponse(jwt, user.getEmail(), user.getRole().name(),
                user.getFullName(), user.getPhone());
    }
    
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        // Create new user
        var user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .loyaltyPoints(0)
                .createdAt(LocalDateTime.now())
                .role(UserRole.CUSTOMER) // Changed from USER to CUSTOMER
                .build();
        
        userRepository.save(user);
        
        // Generate token
        var jwt = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPasswordHash())
                        .authorities("ROLE_" + user.getRole().name())
                        .build()
        );
        
//        return new AuthResponse(jwt, user.getEmail(), user.getRole().name());
        return new AuthResponse(jwt, user.getEmail(), user.getRole().name(),
                user.getFullName(), user.getPhone());
    }

//    public UserProfileResponse getUserProfile(UUID userId) {
//        // The username should be the email from JWT
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//
//        return new UserProfileResponse(
//                user.getUserId(),
//                user.getEmail(),
//                user.getFullName(),
//                user.getPhone(),
//                user.getRole(),
//                user.getLoyaltyPoints(),
//                user.getCreatedAt(),
//                user.getLastLogin()
//        );
//    }
//
//    public UserProfileResponse updateProfile(UUID userId, UserDto.UserUpdateRequest request) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//
//        // Check if email is being changed to one that already exists
//        if (!user.getEmail().equals(request.email()) &&
//                userRepository.findByEmail(request.email()).isPresent()) {
//            throw new IllegalArgumentException("Email already in use");
//        }
//
//        user.setFullName(request.fullName());
//        user.setEmail(request.email());
//        user.setPhone(request.phone());
//
//        userRepository.save(user);
//
//        return this.getUserProfile(user.getUserId());
//    }
//
//
//    public void changePassword(String email, UserDto.PasswordChangeRequest request) {
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//
//        // Verify current password
//        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
//            throw new IllegalArgumentException("Current password is incorrect");
//        }
//
//        // Update to new password
//        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
//        userRepository.save(user);
//    }


    //this is working but mail change a once is not working
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


    /*//    //This is working  but mail change a once is not working
    public UserDto.UserProfileResponse updateUserProfile(String email, UserDto.UserUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Update fields
        user.setFullName(request.fullName());
        user.setEmail(request.email());
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
    }*/
    public UserDto.UserProfileResponse updateUserProfile(UUID userId, UserDto.UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Update fields
        user.setFullName(request.fullName());
        user.setEmail(request.email());
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

   /* public void changePassword(String username, UserDto.PasswordChangeRequest request) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Update to new password
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

    }*/

    public void changePassword(String email, UserDto.PasswordChangeRequest request) {
        // 1. Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. Validate current password
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new PasswordChangeException("Current password is incorrect");
        }

        // 3. Validate new password isn't same as current
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new PasswordChangeException("New password must be different from current password");
        }

        // 4. Validate password confirmation
        if (!request.passwordsMatch()) {
            throw new PasswordChangeException("New password and confirmation don't match");
        }

        // 5. Additional password strength validation
        validatePasswordStrength(request.newPassword());

        // 6. Update password
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 8) {
            throw new PasswordChangeException("Password must be at least 8 characters");
        }
        // Add more complexity rules as needed
    }

    public boolean userExistsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    // In AuthService
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}