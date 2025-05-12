package com.zerox.csm.dto;

import com.zerox.csm.model.Currency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class SettingsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SettingsResponse {
        private UUID id;
        private String key;
        private String value;
        private String description;
        private boolean isPublic;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSettingsRequest {
        @NotBlank(message = "Key is required")
        private String key;
        
        @NotBlank(message = "Value is required")
        private String value;
        
        private String description;
        
        @NotNull(message = "Public flag is required")
        private Boolean isPublic;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateSettingsRequest {
        @NotBlank(message = "Value is required")
        private String value;
        
        private String description;
        
        private Boolean isPublic;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublicSettingsResponse {
        private String key;
        private String value;
        private String description;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrencySettingsResponse {
        private Currency currency;
    }
} 