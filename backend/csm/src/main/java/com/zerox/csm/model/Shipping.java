package com.zerox.csm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "shipping")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shipping {
    
    public enum Status {
        PROCESSING, IN_TRANSIT, DELIVERED, DELAYED
    }
    
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "shipping_id")
    private UUID shippingId;
    
    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;
    
    @Column(name = "tracking_number", unique = true)
    private String trackingNumber;
    
    @Column(name = "carrier", nullable = false)
    private String carrier;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;
    
    @Column(name = "estimated_delivery")
    private LocalDate estimatedDelivery;
} 