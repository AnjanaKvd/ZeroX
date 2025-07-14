package com.zerox.csm.controllers;

import com.zerox.csm.dto.PaymentRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
class PaymentControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void shouldCreatePaymentIntent() throws Exception {
        PaymentRequest request = new PaymentRequest();
        request.setOrderId("test-order-123");
        request.setAmount(1000L);
        request.setCurrency("lkr");
        
        mockMvc.perform(MockMvcRequestBuilders.post("/api/payments/create-payment-intent")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"orderId\":\"test-order-123\",\"amount\":1000,\"currency\":\"lkr\"}")
            )
            .andExpect(status().isOk());
    }
}
