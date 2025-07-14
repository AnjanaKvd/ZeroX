# Stripe Payment Integration Documentation

## Overview
This document provides detailed information about the Stripe payment integration in the Computer Shop Management System (CSM).

## Configuration

### Environment Variables
- `STRIPE_SECRET_KEY`: Your Stripe secret key (from Stripe Dashboard)
  - This should be your test key during development
  - Keep this key secure and never commit it to version control

### Application Properties
The Stripe secret key is referenced in `application.properties` as:
```
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
```

## API Endpoints

### Create Payment Intent
- **Endpoint**: `/api/payments/create-payment-intent`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "orderId": "string",
    "amount": number,  // Amount in the smallest currency unit (e.g., cents for USD, cents for LKR)
    "currency": "string"  // Currency code (e.g., "usd", "lkr")
  }
  ```
- **Response**:
  - Success: 200 OK with Stripe PaymentIntent object
  - Error: Appropriate HTTP status code with error message

## Error Handling
The integration handles various Stripe-specific errors:
- Authentication errors (401)
- Invalid request parameters (400)
- API connection issues (503)
- Card errors (400)
- Rate limiting (429)

## Security Considerations
1. Never expose the Stripe secret key in client-side code
2. Use Stripe's test mode during development
3. Validate all input parameters server-side
4. Handle errors gracefully to prevent information leakage

## Testing
To test the payment integration:
1. Ensure your Stripe test key is set in the environment
2. Use the test endpoint with sample data:
   ```json
   {
     "orderId": "test-order-123",
     "amount": 1000,  // 1000 cents = 10 USD
     "currency": "usd"
   }
   ```
3. Verify the response contains a valid PaymentIntent object

## Production Considerations
1. Switch to production Stripe keys only after thorough testing
2. Implement proper logging for production errors
3. Monitor Stripe API usage and rate limits
4. Regularly review and update security measures
