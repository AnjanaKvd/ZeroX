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
@Table(name = "stock_alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAlert {
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "alert_id")
    private UUID alertId;
    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
    
    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
} 