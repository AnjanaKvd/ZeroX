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
import org.springframework.web.bind.annotation.CrossOrigin;

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

        // Check if user is deleted
        if(user.isDeleted()) {
            throw new UsernameNotFoundException("No Access! This account has been deleted");
        }


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


    @Transactional
    public void deleteAccount(UUID userId) {
        // Verify user exists and isn't already deleted
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isDeleted()) {
            throw new IllegalStateException("Account already deleted");
        }

        // Perform the soft delete
        userRepository.softDelete(userId);
    }

    public AuthResponse register(RegisterRequest request) {
        // Check if email has been used more than 3 times (including deleted accounts)
        int emailUsageCount = userRepository.countByEmail(request.email());
        if (emailUsageCount >= 3) {
            throw new IllegalArgumentException("This email has reached maximum registration attempts");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.email()).isPresent()) {

            throw new IllegalArgumentException("Email already in use");
        }

        // Check if deleted account exists
        Optional<User> deletedUser = userRepository.findByEmailIncludeDeleted(request.email());
        if (deletedUser.isPresent() && deletedUser.get().isDeleted()) {
            // Reactivate the deleted account with new details
            User user = deletedUser.get();
            user.setDeleted(false);
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            user.setFullName(request.fullName());
            user.setPhone(request.phone());
            user.setCreatedAt(LocalDateTime.now());
            user.setLastLogin(null);

            //new token for new user
            User savedUser = userRepository.save(user);
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
                .isDeleted(false)
                .build();

        userRepository.save(user);
        return generateAuthorResponse(user);
    }




    private AuthResponse generateAuthorResponse(User user) {
        var jwt = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPasswordHash())
                        .authorities("ROLE_" + user.getRole().name())
                        .build()
        );

        return new AuthResponse(jwt, user.getEmail(), user.getRole().name(),
                user.getFullName(), user.getPhone());
    }


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



    public UserDto.UserProfileResponse updateUserProfile(String email, UserDto.UserUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update allowed fields
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

       // Verifying current password
       if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
           throw new PasswordChangeException("Current password is incorrect");
       }

       // Validating new password
       if (request.newPassword().length() < 8) {
           throw new PasswordChangeException("Password must be at least 8 characters");
       }

       // Verifying password confirmation
       if (!request.newPassword().equals(request.confirmPassword())) {
           throw new PasswordChangeException("New passwords don't match");
       }

       // Update password
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