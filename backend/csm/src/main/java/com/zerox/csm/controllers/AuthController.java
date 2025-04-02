package com.zerox.csm.controllers;

import com.zerox.csm.dto.AuthDto.AuthResponse;
import com.zerox.csm.dto.AuthDto.LoginRequest;
import com.zerox.csm.dto.AuthDto.RegisterRequest;
import com.zerox.csm.dto.UserDto;
import com.zerox.csm.dto.UserDto.UserProfileResponse;
import com.zerox.csm.exception.PasswordChangeException;
import com.zerox.csm.model.User;
import com.zerox.csm.repository.UserRepository;
import com.zerox.csm.security.JwtService;
import com.zerox.csm.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;



    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }


    //This is the endpoint to get the user profile details read from the database
    //localhost:8080/api/auth/profile



    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getUserProfile(userDetails.getUsername()));
    }

    //This is the endpoint to update the user profile details to the database
    //localhost:8080/api/auth/profile



@PutMapping("/profile")
public ResponseEntity<UserProfileResponse> updateProfile(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody UserDto.UserUpdateRequest request) {

    // Only allow updating the current user's profile
    UserProfileResponse response = authService.updateUserProfile(
            userDetails.getUsername(), // email from token
            request
    );
    return ResponseEntity.ok(response);
}



    @PostMapping("/changepassword")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserDto.PasswordChangeRequest request) {

        try {
            authService.changePassword(userDetails.getUsername(), request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password changed successfully"
            ));
        } catch (PasswordChangeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Since JWT is stateless, server-side logout isn't strictly necessary
        // But you could implement token blacklisting if needed
        return ResponseEntity.noContent().build();
    }
}
