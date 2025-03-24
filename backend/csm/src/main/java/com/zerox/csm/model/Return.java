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
@Table(name = "returns")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Return {
    
    public enum Status {
        REQUESTED, APPROVED, REFUNDED
    }
    
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "return_id")
    private UUID returnId;
    
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
    
    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;
    
    @Column(name = "refund_amount")
    private BigDecimal refundAmount;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
} 