package com.zerox.csm.dto;

import com.zerox.csm.model.RepairRequest.DeviceType;
import com.zerox.csm.model.RepairRequest.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class RepairRequestDto {
    
    public record RepairRequestCreateRequest(
        @NotNull UUID userId,
        @NotNull DeviceType deviceType,
        @NotBlank String deviceBrand,
        @NotBlank String deviceModel,
        @NotBlank String issueDetails
    ) {}
    
    public record RepairRequestUpdateRequest(
        @NotNull Status status,
        String technicianNotes,
        BigDecimal estimatedCost,
        BigDecimal serviceFee
    ) {}
    
    public record RepairRequestResponse(
        UUID repairId,
        UUID userId,
        String customerName,
        DeviceType deviceType,
        String deviceBrand,
        String deviceModel,
        String issueDetails,
        Status status,
        String technicianNotes,
        BigDecimal estimatedCost,
        BigDecimal serviceFee,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}
} 