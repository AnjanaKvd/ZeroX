
# API Documentation for Frontend Development

This documentation provides a comprehensive guide to the Computer Shop Management System (CSMS) API endpoints for frontend developers.

## Base URL

All API endpoints are relative to: `http://localhost:8080`

## Authentication

The API uses JWT (JSON Web Token) for authentication. For protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "status": 400,
  "message": "Error message description",
  "timestamp": "2023-12-05T10:15:30.123"
}
```

For validation errors:

```json
{
  "status": 400,
  "message": "Validation error",
  "timestamp": "2023-12-05T10:15:30.123",
  "validationErrors": {
    "fieldName1": "Error message for field1",
    "fieldName2": "Error message for field2"
  }
}
```

## API Endpoints

### Authentication

#### Register a new user

- **URL**: `/api/auth/register`
- **Method**: POST
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "phone": "1234567890"
  }
  ```
- **Response**: 
  ```json
  {
    "token": "jwt_token_here",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
  ```

#### Login

- **URL**: `/api/auth/login`
- **Method**: POST
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: 
  ```json
  {
    "token": "jwt_token_here",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
  ```

#### Get User Profile

- **URL**: `/api/auth/profile`
- **Method**: GET
- **Auth Required**: Yes
- **Response**: 
  ```json
  {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "1234567890",
    "role": "CUSTOMER",
    "loyaltyPoints": 100,
    "createdAt": "2023-01-15T10:30:45",
    "lastLogin": "2023-12-05T08:15:30"
  }
  ```

#### Logout

- **URL**: `/api/auth/logout`
- **Method**: POST
- **Auth Required**: Yes
- **Response**: 204 No Content

### Products

#### Search/List Products

- **URL**: `/api/products`
- **Method**: GET
- **Auth Required**: No
- **URL Parameters**:
  - `query` (optional): Search term
  - `categoryId` (optional): Filter by category UUID
  - `minPrice` (optional): Minimum price filter
  - `maxPrice` (optional): Maximum price filter
  - `brand` (optional): Filter by brand name
  - `sortBy` (optional, default="name"): Field to sort by
  - `sortDirection` (optional, default="asc"): Sort direction ("asc" or "desc")
  - `page` (optional, default=0): Page number for pagination
  - `size` (optional, default=20): Items per page
- **Response**:
  ```json
  {
    "content": [
      {
        "productId": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Gaming Laptop",
        "description": "High-performance gaming laptop",
        "price": 1299.99,
        "category": {
          "categoryId": "123e4567-e89b-12d3-a456-426614174001",
          "name": "Laptops"
        },
        "sku": "LT-GAM-001",
        "brand": "TechBrand",
        "stockQuantity": 15,
        "barcode": "1234567890123",
        "warrantyPeriodMonths": 24
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "totalPages": 5,
    "totalElements": 100,
    "last": false,
    "size": 20,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "numberOfElements": 20,
    "first": true,
    "empty": false
  }
  ```

#### Get Product by ID

- **URL**: `/api/products/{productId}`
- **Method**: GET
- **Auth Required**: No
- **URL Parameters**:
  - `productId`: UUID of the product
- **Response**:
  ```json
  {
    "productId": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "category": {
      "categoryId": "123e4567-e89b-12d3-a456-426614174001",
      "name": "Laptops"
    },
    "sku": "LT-GAM-001",
    "brand": "TechBrand",
    "stockQuantity": 15,
    "barcode": "1234567890123",
    "warrantyPeriodMonths": 24
  }
  ```

#### Create Product

- **URL**: `/api/products`
- **Method**: POST
- **Auth Required**: Yes (ADMIN role)
- **Request Body**:
  ```json
  {
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "categoryId": "123e4567-e89b-12d3-a456-426614174001",
    "sku": "LT-GAM-001",
    "brand": "TechBrand",
    "stockQuantity": 15,
    "lowStockThreshold": 5,
    "barcode": "1234567890123",
    "warrantyPeriodMonths": 24
  }
  ```
- **Response**: Same as Get Product by ID

#### Update Product

- **URL**: `/api/products/{productId}`
- **Method**: PUT
- **Auth Required**: Yes (ADMIN role)
- **URL Parameters**:
  - `productId`: UUID of the product
- **Request Body**: Same as Create Product
- **Response**: Same as Get Product by ID

#### Update Product Stock

- **URL**: `/api/products/{productId}/stock`
- **Method**: PUT
- **Auth Required**: Yes (ADMIN, TECHNICIAN role)
- **URL Parameters**:
  - `productId`: UUID of the product
- **Request Body**:
  ```json
  {
    "quantity": 10,
    "type": "ADD"  // or "SUBTRACT" or "SET"
  }
  ```
- **Response**: Same as Get Product by ID

#### Get Product Inventory Logs

- **URL**: `/api/products/{productId}/inventory-logs`
- **Method**: GET
- **Auth Required**: Yes (ADMIN, TECHNICIAN role)
- **URL Parameters**:
  - `productId`: UUID of the product
  - `startDate` (optional): Start date for filtering logs (ISO format)
  - `endDate` (optional): End date for filtering logs (ISO format)
  - `page` (optional, default=0): Page number
  - `size` (optional, default=20): Items per page
- **Response**:
  ```json
  {
    "content": [
      {
        "logId": "123e4567-e89b-12d3-a456-426614174000",
        "productId": "123e4567-e89b-12d3-a456-426614174001",
        "productName": "Gaming Laptop",
        "quantity": 5,
        "type": "ADD",
        "previousStock": 10,
        "newStock": 15,
        "timestamp": "2023-12-05T10:15:30.123",
        "userId": "123e4567-e89b-12d3-a456-426614174002",
        "userName": "Admin User"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "totalPages": 2,
    "totalElements": 30,
    "last": false,
    "size": 20,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "numberOfElements": 20,
    "first": true,
    "empty": false
  }
  ```

### Categories

#### Get All Categories

- **URL**: `/api/categories`
- **Method**: GET
- **Auth Required**: No
- **Response**:
  ```json
  [
    {
      "categoryId": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Laptops",
      "description": "Portable computers"
    },
    {
      "categoryId": "123e4567-e89b-12d3-a456-426614174001",
      "name": "Desktops",
      "description": "Stationary computers"
    }
  ]
  ```

#### Get Category by ID

- **URL**: `/api/categories/{categoryId}`
- **Method**: GET
- **Auth Required**: No
- **URL Parameters**:
  - `categoryId`: UUID of the category
- **Response**:
  ```json
  {
    "categoryId": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Laptops",
    "description": "Portable computers"
  }
  ```

#### Create Category

- **URL**: `/api/categories`
- **Method**: POST
- **Auth Required**: Yes (ADMIN role)
- **Request Body**:
  ```json
  {
    "name": "Tablets",
    "description": "Portable touchscreen devices"
  }
  ```
- **Response**: Same as Get Category by ID

#### Update Category

- **URL**: `/api/categories/{categoryId}`
- **Method**: PUT
- **Auth Required**: Yes (ADMIN role)
- **URL Parameters**:
  - `categoryId`: UUID of the category
- **Request Body**: Same as Create Category
- **Response**: Same as Get Category by ID

#### Delete Category

- **URL**: `/api/categories/{categoryId}`
- **Method**: DELETE
- **Auth Required**: Yes (ADMIN role)
- **URL Parameters**:
  - `categoryId`: UUID of the category
- **Response**: 204 No Content

### Reviews

#### Get Product Reviews

- **URL**: `/api/reviews/product/{productId}`
- **Method**: GET
- **Auth Required**: No
- **URL Parameters**:
  - `productId`: UUID of the product
  - `page` (optional, default=0): Page number
  - `size` (optional, default=20): Items per page
- **Response**:
  ```json
  {
    "content": [
      {
        "reviewId": "123e4567-e89b-12d3-a456-426614174000",
        "productId": "123e4567-e89b-12d3-a456-426614174001",
        "productName": "Gaming Laptop",
        "userId": "123e4567-e89b-12d3-a456-426614174002",
        "userName": "John Doe",
        "rating": 5,
        "comment": "Excellent product, very fast and reliable.",
        "createdAt": "2023-12-01T15:30:45"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "totalPages": 1,
    "totalElements": 5,
    "last": true,
    "size": 20,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "numberOfElements": 5,
    "first": true,
    "empty": false
  }
  ```

#### Create Review

- **URL**: `/api/reviews`
- **Method**: POST
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "productId": "123e4567-e89b-12d3-a456-426614174001",
    "rating": 5,
    "comment": "Excellent product, very fast and reliable."
  }
  ```
- **Response**:
  ```json
  {
    "reviewId": "123e4567-e89b-12d3-a456-426614174000",
    "productId": "123e4567-e89b-12d3-a456-426614174001",
    "productName": "Gaming Laptop",
    "userId": "123e4567-e89b-12d3-a456-426614174002",
    "userName": "John Doe",
    "rating": 5,
    "comment": "Excellent product, very fast and reliable.",
    "createdAt": "2023-12-05T15:30:45"
  }
  ```

### Orders

#### Create Order

- **URL**: `/api/orders`
- **Method**: POST
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "items": [
      {
        "productId": "123e4567-e89b-12d3-a456-426614174000",
        "quantity": 1
      },
      {
        "productId": "123e4567-e89b-12d3-a456-426614174001",
        "quantity": 2
      }
    ],
    "paymentMethod": "CREDIT_CARD",
    "shippingAddressId": "123e4567-e89b-12d3-a456-426614174002",
    "discountCode": "SUMMER10"
  }
  ```
- **Response**:
  ```json
  {
    "orderId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "123e4567-e89b-12d3-a456-426614174001",
    "items": [
      {
        "productId": "123e4567-e89b-12d3-a456-426614174002",
        "productName": "Gaming Laptop",
        "quantity": 1,
        "unitPrice": 1299.99,
        "totalPrice": 1299.99
      },
      {
        "productId": "123e4567-e89b-12d3-a456-426614174003",
        "productName": "Gaming Mouse",
        "quantity": 2,
        "unitPrice": 49.99,
        "totalPrice": 99.98
      }
    ],
    "totalAmount": 1399.97,
    "status": "PENDING",
    "paymentMethod": "CREDIT_CARD",
    "paymentId": "pay_123456789",
    "createdAt": "2023-12-05T16:45:30"
  }
  ```

#### Get User Orders

- **URL**: `/api/orders`
- **Method**: GET
- **Auth Required**: Yes
- **URL Parameters**:
  - `status` (optional): Filter by order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
  - `page` (optional, default=0): Page number
  - `size` (optional, default=20): Items per page
- **Response**:
  ```json
  {
    "content": [
      {
        "orderId": "123e4567-e89b-12d3-a456-426614174000",
        "totalAmount": 1399.97,
        "status": "PENDING",
        "createdAt": "2023-12-05T16:45:30",
        "itemCount": 3
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "totalPages": 1,
    "totalElements": 1,
    "last": true,
    "size": 20,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "numberOfElements": 1,
    "first": true,
    "empty": false
  }
  ```

#### Get Order by ID

- **URL**: `/api/orders/{orderId}`
- **Method**: GET
- **Auth Required**: Yes
- **URL Parameters**:
  - `orderId`: UUID of the order
- **Response**: Same as Create Order response

#### Cancel Order

- **URL**: `/api/orders/{orderId}/cancel`
- **Method**: POST
- **Auth Required**: Yes
- **URL Parameters**:
  - `orderId`: UUID of the order
- **Response**: Same as Get Order by ID response with updated status

### Shipping

#### Track Shipment

- **URL**: `/api/shipping/track/{trackingNumber}`
- **Method**: GET
- **Auth Required**: No
- **URL Parameters**:
  - `trackingNumber`: Shipping tracking number
- **Response**:
  ```json
  {
    "trackingNumber": "TRK123456789",
    "orderId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "IN_TRANSIT",
    "carrierName": "FedEx",
    "estimatedDelivery": "2023-12-10",
    "events": [
      {
        "timestamp": "2023-12-06T10:15:30",
        "location": "Sorting Facility, New York",
        "description": "Package arrived at facility"
      },
      {
        "timestamp": "2023-12-05T18:30:45",
        "location": "Warehouse, Chicago",
        "description": "Package shipped"
      }
    ]
  }
  ```

### Discounts

#### Verify Discount Code

- **URL**: `/api/discounts/verify`
- **Method**: GET
- **Auth Required**: No
- **URL Parameters**:
  - `code`: Discount code
- **Response**:
  ```json
  {
    "discountId": "123e4567-e89b-12d3-a456-426614174000",
    "code": "SUMMER10",
    "discountType": "PERCENTAGE",
    "value": 10.0,
    "validUntil": "2023-12-31T23:59:59",
    "maxUses": 1000,
    "currentUses": 45,
    "isValid": true
  }
  ```

## Implementation Notes

### Authentication Flow

1. Register a new user account or login with existing credentials
2. Store the JWT token returned from the server
3. Include the token in the Authorization header for all subsequent authenticated requests
4. Handle token expiration by redirecting to the login page

### Error Handling

1. For 4xx client errors, display the error message from the API response
2. For validation errors, show field-specific error messages next to form fields
3. For 5xx server errors, show a generic error message and retry functionality
4. Implement appropriate error boundaries in your frontend application

### Best Practices

1. Implement token refresh mechanism to maintain user sessions
2. Use proper form validation before submitting to the API
3. Implement loading states during API calls
4. Cache frequently accessed data like product categories
5. For admin interfaces, implement proper confirmation dialogs for destructive actions

## Testing API Endpoints

Here are some sample API tests using cURL:

```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "phone": "1234567890"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get user profile (authenticated)
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get products
curl -X GET "http://localhost:8080/api/products?page=0&size=10&sortBy=price&sortDirection=desc"

# Get product by ID
curl -X GET http://localhost:8080/api/products/123e4567-e89b-12d3-a456-426614174000

# Get categories
curl -X GET http://localhost:8080/api/categories

# Verify discount code
curl -X GET "http://localhost:8080/api/discounts/verify?code=SUMMER10"
```

This documentation should provide all the necessary information for frontend developers to integrate with the Computer Shop Management System API.
