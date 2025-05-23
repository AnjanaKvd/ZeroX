package com.zerox.csm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "repairs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE repairs SET is_deleted = 1 WHERE repair_id = ?")
public class Repair {
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "repair_id")
    private UUID repairId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "device_type", nullable = false)
    private String deviceType;
    
    @Column(name = "device_model", nullable = false)
    private String deviceModel;
    
    @Column(name = "serial_number")
    private String serialNumber;
    
    @Column(name = "problem_description", nullable = false, columnDefinition = "TEXT")
    private String problemDescription;
    
    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RepairStatus status;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private User technician;
    
    @Column(name = "estimated_completion_date")
    private LocalDateTime estimatedCompletionDate;
    
    @Column(name = "actual_completion_date")
    private LocalDateTime actualCompletionDate;
    
    @Column(name = "diagnostic_notes", columnDefinition = "TEXT")
    private String diagnosticNotes;
    
    @Column(name = "repair_cost")
    private Double repairCost;
    
    @Column(name = "is_paid")
    private Boolean isPaid;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "is_deleted", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isDeleted;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = RepairStatus.PENDING;
        }
        if (this.isPaid == null) {
            this.isPaid = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 