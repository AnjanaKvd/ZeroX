package com.zerox.csm.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull(message = "Order ID is required")
    private String orderId;
    
    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount must be positive")
    private Long amount;
    
    @NotNull(message = "Currency is required")
    private String currency;
}
