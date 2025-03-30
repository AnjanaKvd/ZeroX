package com.zerox.csm.dto;

import com.zerox.csm.model.Return.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ReturnDto {
    
    public record ReturnCreateRequest(
        @NotNull UUID orderId,
        @NotBlank String reason
    ) {}
    
    public record ReturnUpdateRequest(
        @NotNull Status status,
        BigDecimal refundAmount
    ) {}
    
    public record ReturnResponse(
        UUID returnId,
        UUID orderId,
        String reason,
        Status status,
        BigDecimal refundAmount,
        LocalDateTime processedAt
    ) {}
} 