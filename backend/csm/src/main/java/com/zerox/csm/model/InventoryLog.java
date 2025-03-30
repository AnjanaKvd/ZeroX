package com.zerox.csm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLog {
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "log_id")
    private UUID logId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "old_quantity", nullable = false)
    private Integer oldQuantity;
    
    @Column(name = "new_quantity", nullable = false)
    private Integer newQuantity;
    
    @Column(name = "change_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private InventoryChangeType changeType;
    
    @ManyToOne
    @JoinColumn(name = "changed_by")
    private User changedBy;
    
    @Column(name = "timestamp")
    private LocalDateTime timestamp;
    
    public enum InventoryChangeType {
        RESTOCK,
        SALE,
        ADJUSTMENT
    }
} 