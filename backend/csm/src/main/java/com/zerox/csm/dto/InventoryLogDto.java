package com.zerox.csm.dto;

import com.zerox.csm.model.InventoryLog.InventoryChangeType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.util.UUID;

public class InventoryLogDto {
    
    public record InventoryLogRequest(
            @NotNull UUID productId,
            @NotNull @Positive int oldQuantity,
            @NotNull @Positive int newQuantity,
            @NotNull InventoryChangeType changeType,
            UUID changedById
    ) {}
    
    public record InventoryLogResponse(
            UUID logId,
            UUID productId,
            String productName,
            int oldQuantity,
            int newQuantity,
            InventoryChangeType changeType,
            String changedByName,
            LocalDateTime timestamp
    ) {}
} 