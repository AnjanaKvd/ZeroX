package com.zerox.csm.dto;

import com.zerox.csm.model.RepairStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepairDto {
    private UUID repairId;
    private UUID userId;
    private String userFullName;
    private String userEmail;
    private String deviceType;
    private String deviceModel;
    private String serialNumber;
    private String problemDescription;
    private String additionalNotes;
    private RepairStatus status;
    private UUID technicianId;
    private String technicianName;
    private LocalDateTime estimatedCompletionDate;
    private LocalDateTime actualCompletionDate;
    private String diagnosticNotes;
    private Double repairCost;
    private Boolean isPaid;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 