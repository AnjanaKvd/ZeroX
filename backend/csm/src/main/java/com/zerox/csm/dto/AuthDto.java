package com.zerox.csm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {
    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}
    
    public record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password,
            @NotBlank String fullName,
            String phone
    ) {}
    
    public record AuthResponse(
            String token,
            String email,
            String role
    ) {}
} 