package com.zerox.csm.dto;

import lombok.Data;

@Data
public class PaymentIntentResponse {
    private String id;
    private String clientSecret;
    private String status;
    private Long amount;
    private String currency;
    private String paymentMethodTypes;
    private String description;
}
