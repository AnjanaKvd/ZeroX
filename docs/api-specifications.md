---

# API Specifications

This document outlines the REST API endpoints for the **Computer Shop Management and Online Store Platform**. Each endpoint follows RESTful principles and is secured using JWT authentication.

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Product Management](#product-management)
- [Inventory Management](#inventory-management)
- [Orders & Payments](#orders--payments)
- [Customer Management](#customer-management)
- [Repair & Service Tracking](#repair--service-tracking)
- [Analytics & Reports](#analytics--reports)

---

## Authentication

| Method | Endpoint              | Description                     | Authentication |
|--------|-----------------------|---------------------------------|---------------|
| POST   | `/api/auth/register`  | Registers a new user           | ❌ Public |
| POST   | `/api/auth/login`     | Logs in and returns JWT token  | ❌ Public |
| POST   | `/api/auth/logout`    | Logs out the user              | ✅ Required |
| GET    | `/api/auth/profile`   | Fetches logged-in user profile | ✅ Required |

**Request Example (Login):**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
**Response Example (JWT Token):**
```json
{
  "token": "eyJhbGciOiJIUzI1..."
}
```

---

## User Management

| Method | Endpoint                | Description                      | Authentication |
|--------|-------------------------|----------------------------------|---------------|
| GET    | `/api/users`            | Fetch all users                 | ✅ Admin Only |
| GET    | `/api/users/{id}`       | Get a specific user             | ✅ Admin/User |
| PUT    | `/api/users/{id}`       | Update user profile             | ✅ User/Admin |
| DELETE | `/api/users/{id}`       | Delete user account             | ✅ Admin Only |

---

## Product Management

| Method | Endpoint                 | Description                      | Authentication |
|--------|--------------------------|----------------------------------|---------------|
| GET    | `/api/products`          | List all products               | ❌ Public |
| GET    | `/api/products/{id}`     | Get a single product            | ❌ Public |
| POST   | `/api/products`          | Add a new product               | ✅ Admin Only |
| PUT    | `/api/products/{id}`     | Update product details          | ✅ Admin Only |
| DELETE | `/api/products/{id}`     | Remove a product                | ✅ Admin Only |

**Request Example (Create Product):**
```json
{
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "price": 1200.99,
  "stock": 50,
  "category": "Laptops"
}
```

---

## Inventory Management

| Method | Endpoint                     | Description                      | Authentication |
|--------|------------------------------|----------------------------------|---------------|
| GET    | `/api/inventory`             | Get inventory details            | ✅ Admin Only |
| PUT    | `/api/inventory/{productId}` | Update stock levels              | ✅ Admin Only |

**Request Example (Update Stock):**
```json
{
  "stock": 45
}
```

---

## Orders & Payments

| Method | Endpoint               | Description                     | Authentication |
|--------|------------------------|---------------------------------|---------------|
| GET    | `/api/orders`          | List all orders                | ✅ Admin Only |
| GET    | `/api/orders/{id}`     | Get order details              | ✅ User/Admin |
| POST   | `/api/orders`          | Create a new order             | ✅ User |
| PUT    | `/api/orders/{id}`     | Update order status            | ✅ Admin Only |
| DELETE | `/api/orders/{id}`     | Cancel an order                | ✅ User |
| POST   | `/api/payments`        | Process payment (Stripe, PayPal) | ✅ User |

**Request Example (Create Order):**
```json
{
  "customerId": 123,
  "products": [
    { "productId": 1, "quantity": 2 },
    { "productId": 5, "quantity": 1 }
  ],
  "paymentMethod": "credit_card"
}
```

---

## Customer Management

| Method | Endpoint                     | Description                       | Authentication |
|--------|------------------------------|-----------------------------------|---------------|
| GET    | `/api/customers`             | List all customers                | ✅ Admin Only |
| GET    | `/api/customers/{id}`        | Get customer details              | ✅ Admin/User |
| PUT    | `/api/customers/{id}`        | Update customer profile           | ✅ Admin/User |

---

## Repair & Service Tracking

| Method | Endpoint                    | Description                          | Authentication |
|--------|-----------------------------|--------------------------------------|---------------|
| GET    | `/api/repairs`              | List all repair/service requests    | ✅ Admin Only |
| GET    | `/api/repairs/{id}`         | Get a specific repair request       | ✅ Admin/User |
| POST   | `/api/repairs`              | Submit a new repair request         | ✅ User |
| PUT    | `/api/repairs/{id}`         | Update repair status                | ✅ Admin Only |

**Request Example (Create Repair Request):**
```json
{
  "customerId": 123,
  "deviceType": "Laptop",
  "issueDescription": "Screen not working",
  "status": "Pending"
}
```

---

## Analytics & Reports

| Method | Endpoint                      | Description                      | Authentication |
|--------|-------------------------------|----------------------------------|---------------|
| GET    | `/api/analytics/sales`        | Fetch sales analytics            | ✅ Admin Only |
| GET    | `/api/analytics/inventory`    | Inventory performance reports    | ✅ Admin Only |
| GET    | `/api/analytics/customers`    | Customer insights                | ✅ Admin Only |

---

## Error Handling

All API responses follow a consistent structure:

**Error Response Example:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid input data",
  "timestamp": "2025-02-01T12:34:56Z"
}
```

| Status Code | Description                |
|-------------|----------------------------|
| 200 OK      | Request was successful     |
| 201 Created | Resource was created      |
| 400 Bad Request | Invalid input parameters |
| 401 Unauthorized | Authentication required |
| 403 Forbidden | Access denied             |
| 404 Not Found | Resource not found        |
| 500 Internal Server Error | Unexpected error |

---

## Conclusion

This API provides a structured and secure way to interact with the **Computer Shop Management System**. Each module ensures smooth integration between the frontend and backend while maintaining security and scalability.

---