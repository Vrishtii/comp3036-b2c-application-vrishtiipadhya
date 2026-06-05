# crave. API Documentation

REST API for the crave. bakery web application, built with Next.js App Router API routes and Supabase.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local development | `http://localhost:3000` |
| Production | `https://comp3036-b2c-application-vrishtiipa.vercel.app` |

All endpoints are prefixed with `/api`.

---

## Authentication

This API uses **Supabase session-based authentication**. After a user logs in via the Supabase client, a session token is stored in the browser's `localStorage`. For server-side API calls, this token must be passed in the `Authorization` header as a Bearer token.

```
Authorization: Bearer <supabase_access_token>
```

**Auth levels used across this API:**

| Level | Description |
|-------|-------------|
| None | Publicly accessible, no token required |
| Authenticated | Requires a valid session token (any logged-in user) |
| Admin | Requires a valid session token where the user's profile `role` is `"admin"` |

---

## General Error Codes

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request — missing or invalid parameters |
| `401` | Unauthorized — no valid session token provided |
| `403` | Forbidden — authenticated but insufficient role (not admin) |
| `404` | Not Found — resource does not exist |
| `500` | Internal Server Error — database or server-side failure |

All error responses follow this shape:

```json
{ "error": "description of the error" }
```

---

## Products

### `GET /api/products`

Returns all available products. Publicly accessible.

**Authentication:** None

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category name (case-insensitive) |
| `search` | string | No | Search by product name or description |
| `limit` | number | No | Limit the number of results returned |

**Example Request:**
```
GET /api/products?category=Brownies&limit=3
```

**Example Success Response** `200 OK`:
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Classic Brownie",
    "description": "Rich, fudgy chocolate brownie baked fresh to order.",
    "price": 4.50,
    "image_url": "https://example.com/brownie.jpg",
    "is_available": true,
    "is_seasonal": false,
    "category_id": "cat-uuid-here",
    "created_at": "2025-01-01T00:00:00Z",
    "categories": { "name": "Brownies" }
  }
]
```

**Example Error Response** `500 Internal Server Error`:
```json
{ "error": "Failed to fetch products" }
```

---

### `GET /api/products/[id]`

Returns a single product by its UUID.

**Authentication:** None

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | The product's unique identifier |

**Example Request:**
```
GET /api/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Example Success Response** `200 OK`:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Classic Brownie",
  "description": "Rich, fudgy chocolate brownie baked fresh to order.",
  "price": 4.50,
  "image_url": "https://example.com/brownie.jpg",
  "is_available": true,
  "is_seasonal": false,
  "category_id": "cat-uuid-here",
  "created_at": "2025-01-01T00:00:00Z",
  "categories": { "name": "Brownies" }
}
```

**Example Error Response** `404 Not Found`:
```json
{ "error": "product not found" }
```

---

### `POST /api/admin/products`

Creates a new product. Admin only.

**Authentication:** Admin

**Request Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Product name |
| `price` | number | Yes | Price in AUD |
| `category_id` | UUID | Yes | ID of the product category |
| `description` | string | No | Product description |
| `image_url` | string | No | URL of the product image |
| `is_available` | boolean | No | Whether the product is listed (default: `true`) |
| `is_seasonal` | boolean | No | Whether the product is seasonal (default: `false`) |

**Example Request:**
```json
POST /api/admin/products
Authorization: Bearer <admin_token>

{
  "name": "Salted Caramel Brownie",
  "price": 5.00,
  "category_id": "cat-uuid-here",
  "description": "Fudgy brownie topped with salted caramel drizzle.",
  "is_available": true,
  "is_seasonal": false
}
```

**Example Success Response** `201 Created`:
```json
{
  "id": "new-product-uuid",
  "name": "Salted Caramel Brownie",
  "price": 5.00,
  "category_id": "cat-uuid-here",
  "description": "Fudgy brownie topped with salted caramel drizzle.",
  "is_available": true,
  "is_seasonal": false,
  "created_at": "2026-01-01T00:00:00Z",
  "categories": { "name": "Brownies" }
}
```

**Example Error Responses:**

`400 Bad Request`:
```json
{ "error": "name, price and category_id are required" }
```

`403 Forbidden`:
```json
{ "error": "forbidden" }
```

---

### `PUT /api/admin/products/[id]`

Updates an existing product. Admin only.

**Authentication:** Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | The product's unique identifier |

**Request Body (JSON):** Any subset of product fields to update (same fields as POST).

**Example Request:**
```json
PUT /api/admin/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <admin_token>

{
  "price": 5.50,
  "is_available": false
}
```

**Example Success Response** `200 OK`:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Classic Brownie",
  "price": 5.50,
  "is_available": false,
  "categories": { "name": "Brownies" }
}
```

**Example Error Response** `404 Not Found`:
```json
{ "error": "product not found" }
```

---

### `DELETE /api/admin/products/[id]`

Deletes a product permanently. Admin only.

**Authentication:** Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | The product's unique identifier |

**Example Request:**
```
DELETE /api/admin/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <admin_token>
```

**Example Success Response** `200 OK`:
```json
{ "message": "product deleted" }
```

**Example Error Response** `500 Internal Server Error`:
```json
{ "error": "Failed to delete product" }
```

---

## Orders

### `POST /api/orders`

Places a new order for the authenticated customer.

**Authentication:** Authenticated

**Request Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | array | Yes | List of order items (see below) |
| `pickup_date` | string | Yes | Date for pickup/delivery (`YYYY-MM-DD`) |
| `pickup_time` | string | Yes | Time slot for pickup/delivery |
| `total_amount` | number | Yes | Total order value in AUD |
| `notes` | string | No | Optional special instructions |

Each item in `items`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product_id` | UUID | Yes | ID of the product |
| `quantity` | number | Yes | Number of units |
| `price_at_purchase` | number | Yes | Price per unit at time of order |
| `custom_notes` | string | No | Item-level notes (e.g. allergy info) |

**Example Request:**
```json
POST /api/orders
Authorization: Bearer <user_token>

{
  "items": [
    {
      "product_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "quantity": 2,
      "price_at_purchase": 4.50,
      "custom_notes": "nut allergy"
    }
  ],
  "pickup_date": "2026-06-10",
  "pickup_time": "10:00 AM - 12:00 PM",
  "total_amount": 9.00
}
```

**Example Success Response** `201 Created`:
```json
{
  "id": "order-uuid",
  "order_number": "CRAVE-4821",
  "user_id": "user-uuid",
  "pickup_date": "2026-06-10",
  "pickup_time": "10:00 AM - 12:00 PM",
  "total_amount": 9.00,
  "status": "pending",
  "notes": null,
  "created_at": "2026-06-05T00:00:00Z"
}
```

**Example Error Response** `400 Bad Request`:
```json
{ "error": "items, pickup_date, pickup_time and total_amount are required" }
```

---

### `GET /api/orders`

Returns all orders belonging to the authenticated customer.

**Authentication:** Authenticated

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by order status (`pending`, `confirmed`, `ready`, `completed`, `cancelled`) |

**Example Request:**
```
GET /api/orders?status=pending
Authorization: Bearer <user_token>
```

**Example Success Response** `200 OK`:
```json
[
  {
    "id": "order-uuid",
    "order_number": "CRAVE-4821",
    "pickup_date": "2026-06-10",
    "pickup_time": "10:00 AM - 12:00 PM",
    "total_amount": 9.00,
    "status": "pending",
    "created_at": "2026-06-05T00:00:00Z",
    "order_items": [
      {
        "id": "item-uuid",
        "quantity": 2,
        "price_at_purchase": 4.50,
        "custom_notes": "nut allergy",
        "products": {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "Classic Brownie",
          "image_url": "https://example.com/brownie.jpg"
        }
      }
    ]
  }
]
```

**Example Error Response** `401 Unauthorized`:
```json
{ "error": "unauthorized" }
```

---

### `GET /api/orders/[id]`

Returns a single order by UUID or order number. Only accessible by the order owner or an admin.

**Authentication:** Authenticated

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID or string | Yes | Order UUID or order number (e.g. `CRAVE-4821`) |

**Example Request:**
```
GET /api/orders/CRAVE-4821
Authorization: Bearer <user_token>
```

**Example Success Response** `200 OK`:
```json
{
  "id": "order-uuid",
  "order_number": "CRAVE-4821",
  "pickup_date": "2026-06-10",
  "pickup_time": "10:00 AM - 12:00 PM",
  "total_amount": 9.00,
  "status": "pending",
  "created_at": "2026-06-05T00:00:00Z",
  "order_items": [
    {
      "id": "item-uuid",
      "quantity": 2,
      "price_at_purchase": 4.50,
      "custom_notes": "nut allergy",
      "products": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Classic Brownie",
        "image_url": "https://example.com/brownie.jpg"
      }
    }
  ]
}
```

**Example Error Response** `404 Not Found`:
```json
{ "error": "order not found" }
```

---

### `GET /api/admin/orders`

Returns all orders across all customers. Admin only.

**Authentication:** Admin

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (`pending`, `confirmed`, `ready`, `completed`, `cancelled`) |
| `pickup_date` | string | No | Filter by pickup date (`YYYY-MM-DD`) |
| `search` | string | No | Search by order number |

**Example Request:**
```
GET /api/admin/orders?status=confirmed&pickup_date=2026-06-10
Authorization: Bearer <admin_token>
```

**Example Success Response** `200 OK`:
```json
[
  {
    "id": "order-uuid",
    "order_number": "CRAVE-4821",
    "pickup_date": "2026-06-10",
    "pickup_time": "10:00 AM - 12:00 PM",
    "total_amount": 9.00,
    "status": "confirmed",
    "created_at": "2026-06-05T00:00:00Z",
    "profiles": {
      "id": "user-uuid",
      "full_name": "Jane Smith",
      "email": "jane@example.com"
    },
    "order_items": [
      {
        "id": "item-uuid",
        "quantity": 2,
        "price_at_purchase": 4.50,
        "custom_notes": null,
        "products": {
          "id": "product-uuid",
          "name": "Classic Brownie",
          "image_url": "https://example.com/brownie.jpg"
        }
      }
    ]
  }
]
```

**Example Error Response** `403 Forbidden`:
```json
{ "error": "forbidden" }
```

---

### `PUT /api/admin/orders/[id]`

Updates the status of an order. Admin only.

**Authentication:** Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | The order's unique identifier |

**Request Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New status: `pending`, `confirmed`, `ready`, or `completed` |

**Example Request:**
```json
PUT /api/admin/orders/order-uuid
Authorization: Bearer <admin_token>

{
  "status": "confirmed"
}
```

**Example Success Response** `200 OK`:
```json
{
  "id": "order-uuid",
  "order_number": "CRAVE-4821",
  "status": "confirmed",
  "pickup_date": "2026-06-10",
  "total_amount": 9.00,
  "profiles": {
    "id": "user-uuid",
    "full_name": "Jane Smith",
    "email": "jane@example.com"
  },
  "order_items": [...]
}
```

**Example Error Responses:**

`400 Bad Request`:
```json
{ "error": "status must be one of: pending, confirmed, ready, completed" }
```

`404 Not Found`:
```json
{ "error": "order not found" }
```

---

## Customers (Admin)

### `GET /api/admin/customers`

Returns all customer profiles with order summary data. Admin only.

**Authentication:** Admin

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search by customer name or email |

**Example Request:**
```
GET /api/admin/customers?search=jane
Authorization: Bearer <admin_token>
```

**Example Success Response** `200 OK`:
```json
[
  {
    "id": "user-uuid",
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "0412345678",
    "created_at": "2025-06-01T00:00:00Z",
    "order_count": 3,
    "total_spent": 27.00
  }
]
```

**Example Error Response** `403 Forbidden`:
```json
{ "error": "forbidden" }
```

---

### `GET /api/admin/customers/[id]`

Returns a single customer's full profile including all their orders and order items. Admin only.

**Authentication:** Admin

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | The customer's user ID |

**Example Request:**
```
GET /api/admin/customers/user-uuid
Authorization: Bearer <admin_token>
```

**Example Success Response** `200 OK`:
```json
{
  "id": "user-uuid",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "0412345678",
  "created_at": "2025-06-01T00:00:00Z",
  "orders": [
    {
      "id": "order-uuid",
      "order_number": "CRAVE-4821",
      "status": "completed",
      "total_amount": 9.00,
      "pickup_date": "2026-06-10",
      "order_items": [
        {
          "id": "item-uuid",
          "quantity": 2,
          "price_at_purchase": 4.50,
          "custom_notes": null,
          "products": { "id": "product-uuid", "name": "Classic Brownie" }
        }
      ]
    }
  ]
}
```

**Example Error Response** `404 Not Found`:
```json
{ "error": "customer not found" }
```

---

## Profile

### `GET /api/profile`

Returns the authenticated user's own profile.

**Authentication:** Authenticated

**Example Request:**
```
GET /api/profile
Authorization: Bearer <user_token>
```

**Example Success Response** `200 OK`:
```json
{
  "id": "user-uuid",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "0412345678",
  "role": "customer",
  "preferences": ["Brownies", "Cookies"],
  "created_at": "2025-06-01T00:00:00Z"
}
```

**Example Error Response** `404 Not Found`:
```json
{ "error": "profile not found" }
```

---

### `PUT /api/profile`

Updates the authenticated user's own profile. All fields are optional — only include fields to change.

**Authentication:** Authenticated

**Request Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `full_name` | string | No | User's display name |
| `email` | string | No | User's email address (also updates Supabase Auth) |
| `phone` | string | No | Australian phone number |
| `preferences` | string[] | No | Array of preferred categories (e.g. `["Brownies", "Cookies"]`) |

**Example Request:**
```json
PUT /api/profile
Authorization: Bearer <user_token>

{
  "full_name": "Jane A. Smith",
  "preferences": ["Brownies", "Loaves"]
}
```

**Example Success Response** `200 OK`:
```json
{
  "id": "user-uuid",
  "full_name": "Jane A. Smith",
  "email": "jane@example.com",
  "phone": "0412345678",
  "role": "customer",
  "preferences": ["Brownies", "Loaves"],
  "created_at": "2025-06-01T00:00:00Z"
}
```

**Example Error Response** `400 Bad Request`:
```json
{ "error": "no fields to update" }
```

---

### `DELETE /api/profile`

Permanently deletes the authenticated user's profile and Supabase Auth account. This action cannot be undone.

**Authentication:** Authenticated

**Example Request:**
```
DELETE /api/profile
Authorization: Bearer <user_token>
```

**Example Success Response** `200 OK`:
```json
{ "success": true }
```

**Example Error Response** `500 Internal Server Error`:
```json
{ "error": "Failed to delete user" }
```

---

## Order Status Reference

| Status | Description |
|--------|-------------|
| `pending` | Order placed, awaiting admin confirmation |
| `confirmed` | Admin has confirmed the order |
| `ready` | Order is ready for pickup/delivery |
| `completed` | Order has been fulfilled |
| `cancelled` | Order was cancelled |
