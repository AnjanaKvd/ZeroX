
# Product API Documentation

## Product REST API Endpoints

### 1. Search and List Products
```
GET /api/products
```
**Query Parameters:**
- `query` (optional): Text search for product name/description
- `categoryId` (optional): Filter by category UUID
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `brand` (optional): Filter by brand name
- `sortBy` (default: "name"): Field to sort by
- `sortDirection` (default: "asc"): "asc" or "desc"
- `page` (default: 0): Page number (zero-based)
- `size` (default: 20): Page size

**Response:** Page of `ProductResponse` objects

### 2. Get Product by ID
```
GET /api/products/{productId}
```
**Path Variable:**
- `productId`: UUID of product

**Response:** Single `ProductResponse` object

### 3. Get Product by SKU
```
GET /api/products/sku/{sku}
```
**Path Variable:**
- `sku`: Product SKU

**Response:** Single `ProductResponse` object

### 4. Create Product (Admin only)
```
POST /api/products
```
**Request Body:** `ProductRequest`
```json
{
  "name": "String (required)",
  "description": "String (required)",
  "price": "BigDecimal (positive, required)",
  "categoryId": "UUID (required)",
  "sku": "String (required)",
  "brand": "String (optional)",
  "stockQuantity": "Integer (>=0, required)",
  "lowStockThreshold": "Integer (>=0, optional)",
  "barcode": "String (optional)",
  "warrantyPeriodMonths": "Integer (optional)"
}
```

**Response:** `ProductResponse` with HTTP 201 Created

### 5. Update Product (Admin only)
```
PUT /api/products/{productId}
```
**Path Variable:**
- `productId`: UUID of product to update

**Request Body:** Same as Create Product

**Response:** Updated `ProductResponse`

### 6. Delete Product (Admin only)
```
DELETE /api/products/{productId}
```
**Path Variable:**
- `productId`: UUID of product to delete

**Response:** HTTP 204 No Content

### 7. Update Stock (Admin/Technician)
```
POST /api/products/stock
```
**Request Body:** `StockUpdateRequest`
```json
{
  "productId": "UUID (required)",
  "quantityChange": "Integer (can be negative for removals)",
  "changedById": "UUID (user making the change)"
}
```

**Response:** Updated `ProductResponse`

### 8. Get Product Inventory Logs (Admin/Technician)
```
GET /api/products/{productId}/inventory-logs
```
**Path Variable:**
- `productId`: UUID of product

**Query Parameters:**
- `startDate` (optional): Filter logs after this date (ISO format)
- `endDate` (optional): Filter logs before this date (ISO format)
- `page` (default: 0): Page number
- `size` (default: 20): Page size

**Response:** Page of `InventoryLogResponse` objects

## Admin Web Interface Endpoints

### 1. Admin Dashboard
```
GET /admin
```
**Response:** Admin dashboard template

### 2. Product List Page
```
GET /admin/products
```
**Query Parameters:**
- `page` (default: 0): Page number
- `size` (default: 10): Page size

**Response:** Admin product list template with product data

### 3. Create Product Form
```
GET /admin/products/new
```
**Response:** New product form template with category data

### 4. Edit Product Form
```
GET /admin/products/{id}/edit
```
**Path Variable:**
- `id`: UUID of product to edit

**Response:** Edit product form template with product and category data

## Data Models

### ProductResponse
```json
{
  "productId": "UUID",
  "name": "String",
  "description": "String",
  "price": "BigDecimal",
  "categoryName": "String",
  "sku": "String",
  "brand": "String",
  "stockQuantity": "Integer",
  "lowStockThreshold": "Integer",
  "barcode": "String",
  "warrantyPeriodMonths": "Integer",
  "createdAt": "LocalDateTime"
}
```

## Authorization Requirements
- Search/Get APIs: Public access
- Create/Update/Delete APIs: Requires ADMIN role
- Stock management: Requires ADMIN or TECHNICIAN role
- All admin web endpoints: Requires ADMIN role

## Notes
- Product creation automatically logs initial inventory
- Stock updates trigger low stock alerts if quantity drops below threshold
- When updating a product, any change in quantity is logged
- All APIs support validation for required fields and format constraints
