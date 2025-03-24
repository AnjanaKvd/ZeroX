package com.zerox.csm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "repair_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepairRequest {
    
    public enum DeviceType {
        DESKTOP, LAPTOP, OTHER
    }
    
    public enum Status {
        PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    }
    
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "repair_id")
    private UUID repairId;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", nullable = false)
    private DeviceType deviceType;
    
    @Column(name = "device_brand")
    private String deviceBrand;
    
    @Column(name = "device_model")
    private String deviceModel;
    
    @Column(name = "issue_details", nullable = false, columnDefinition = "TEXT")
    private String issueDetails;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;
    
    @Column(name = "technician_notes", columnDefinition = "TEXT")
    private String technicianNotes;
    
    @Column(name = "estimated_cost")
    private BigDecimal estimatedCost;
    
    @Column(name = "service_fee")
    private BigDecimal serviceFee;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
} 