package com.zerox.csm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;


public class AuthDto {
    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {

    }

    public record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 100) String password,
            @NotBlank String fullName,
            @NotBlank String phone

    ) {}

    public record AuthResponse(
            String token,
            String email,
            String role,
            String fullName,
            String phone
    ) {}
}