package com.zerox.csm.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class CartDto {
    @NotNull
    private Integer cartId;

    @NotNull @Min(1)
    private Integer userId;

    @NotNull @Min(1)
    private Integer productId;

    @NotNull @Min(1)
    private Integer quantity;

    @NotNull @Positive
    private Double price;

    @NotNull @PositiveOrZero
    private Double totalPrice;

    // ... other fields
}