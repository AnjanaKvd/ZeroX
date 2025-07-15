package com.zerox.csm.controllers;

import com.stripe.Stripe;
import com.stripe.exception.ApiConnectionException;
import com.stripe.exception.ApiException;
import com.stripe.exception.AuthenticationException;
import com.stripe.exception.CardException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.RateLimitException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.zerox.csm.dto.PaymentIntentResponse;
import com.zerox.csm.dto.PaymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Validated
public class PaymentController {

    @Value("${STRIPE_SECRET_KEY}")
    private String stripeSecretKey;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentRequest request) {
        if (stripeSecretKey == null || stripeSecretKey.isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Stripe secret key is not configured correctly");
        }

        try {
            // Initialize Stripe with the secret key
            Stripe.apiKey = stripeSecretKey;

            // Create payment intent parameters
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(request.getAmount())
                    .setCurrency(request.getCurrency().toLowerCase())
                    .build();

            // Create payment intent
            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Create response DTO with necessary fields
            PaymentIntentResponse response = new PaymentIntentResponse();
            response.setId(paymentIntent.getId());
            response.setClientSecret(paymentIntent.getClientSecret());
            response.setStatus(paymentIntent.getStatus());
            response.setAmount(paymentIntent.getAmount());
            response.setCurrency(paymentIntent.getCurrency());
            response.setPaymentMethodTypes(String.join(",", paymentIntent.getPaymentMethodTypes()));
            response.setDescription(paymentIntent.getDescription());

            return ResponseEntity.ok(response);

        } catch (RateLimitException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Rate limit exceeded: " + e.getMessage());
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Authentication with Stripe failed: " + e.getMessage());
        } catch (InvalidRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request parameters: " + e.getMessage());
        } catch (ApiConnectionException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Failed to connect to Stripe API: " + e.getMessage());
        } catch (CardException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Card error: " + e.getMessage());
        } catch (ApiException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Stripe API error: " + e.getMessage());
        } catch (StripeException e) {  // This is the base exception, should be last
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unhandled Stripe exception: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }
}
