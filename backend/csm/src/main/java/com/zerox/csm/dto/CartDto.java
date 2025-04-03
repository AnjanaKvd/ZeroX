package com.zerox.csm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
import java.math.BigDecimal;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private UUID userId;
    private UUID productId;
    private Integer quantity;
}