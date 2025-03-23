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
@Table(name = "discounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Discount {
    
    public enum DiscountType {
        PERCENTAGE, FIXED
    }
    
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "discount_id")
    private UUID discountId;
    
    @Column(name = "code", nullable = false, unique = true)
    private String code;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;
    
    @Column(name = "value", nullable = false)
    private BigDecimal value;
    
    @Column(name = "max_uses")
    private Integer maxUses;
    
    @Column(name = "valid_from")
    private LocalDateTime validFrom;
    
    @Column(name = "valid_until")
    private LocalDateTime validUntil;
} 