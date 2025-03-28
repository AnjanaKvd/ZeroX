package com.zerox.csm.controllers;

import com.zerox.csm.dto.AuthDto.AuthResponse;
import com.zerox.csm.dto.AuthDto.LoginRequest;
import com.zerox.csm.dto.AuthDto.RegisterRequest;
import com.zerox.csm.dto.UserDto;
import com.zerox.csm.dto.UserDto.UserProfileResponse;
import com.zerox.csm.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
    
    @GetMapping("/myprofile")
    public ResponseEntity<UserProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(authService.getUserProfile(userDetails.getUsername()));
    }

    @PutMapping("/myprofile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserDto.UserUpdateRequest request
    ) {
        return ResponseEntity.ok(authService.updateProfile(userDetails.getUsername(), request));
    }

    @PostMapping("/changepassword")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserDto.PasswordChangeRequest request
    ) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Since JWT is stateless, server-side logout isn't strictly necessary
        // But you could implement token blacklisting if needed
        return ResponseEntity.noContent().build();
    }
}
