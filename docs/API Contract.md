# Modulus — Retail Operations Platform
## API Contract Document
`Version 1.0`

---

## Table of Contents
1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Products API](#3-products-api)
4. [Categories API](#4-categories-api)
5. [Orders API](#5-orders-api)
6. [Customers API](#6-customers-api)
7. [Analytics API](#7-analytics-api)
8. [Standard Error Responses](#8-standard-error-responses)
9. [MSW Handler Implementation Notes](#9-msw-handler-implementation-notes)

---

## 1. Overview

All endpoints are served by Mock Service Worker (MSW) running in the browser. There is no backend server. MSW intercepts fetch requests at the defined paths and returns seeded JSON responses that conform to the type definitions in `packages/types`.

All endpoints follow REST conventions. All request and response bodies use JSON. All timestamps are ISO 8601 strings. All monetary values are numbers representing currency in the smallest unit (cents).

---

## 2. Authentication

All endpoints except `POST /api/auth/login` require a valid Bearer token in the `Authorization` header.

```
Authorization: Bearer <jwt_token>
```

Requests without a valid token receive a 401 response.

### `POST /api/auth/login`
*Authenticate and receive a JWT token*

**Request body:**
```json
{
  "email": "ops@modulus.com",
  "password": "password123"
}
```

**Success (200):**
```json
{
  "token": "<jwt_string>",
  "user": {
    "id": "u1",
    "email": "ops@modulus.com",
    "name": "Operations Manager",
    "role": "ops_manager"
  }
}
```

**Error (401):**
```json
{ "error": "Invalid credentials" }
```

---

## 3. Products API

All endpoints in this section are consumed exclusively by `modulus-inventory`.

### `GET /api/products`
*Return a paginated list of products*

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No (default: 1) | Page number, 1-indexed |
| limit | number | No (default: 20) | Items per page, maximum 100 |
| search | string | No | Case-insensitive match against name or SKU |
| category | string | No | Filter by category name |
| stockStatus | string | No | One of: in_stock, low_stock, out_of_stock |
| active | boolean | No (default: true) | Filter by active status |

**Success (200):**
```json
{
  "data": [
    {
      "id": "p1",
      "name": "...",
      "sku": "...",
      "category": "...",
      "price": 2999,
      "stock": 45,
      "active": true,
      "imageUrl": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 120, "totalPages": 6 }
}
```

---

### `POST /api/products`
*Create a new product*

**Request body:**
```json
{
  "name": "Wireless Headphones",
  "sku": "WH-1001",
  "category": "Electronics",
  "price": 7999,
  "stock": 50,
  "imageUrl": "https://..."
}
```

**Success (201):** the created Product object.
**Error (400):** validation failure. **Error (409):** SKU already exists.

---

### `GET /api/products/:id`
*Return a single product by ID*

**Success (200):** the Product object. **Error (404):** not found.

---

### `PATCH /api/products/:id`
*Update product fields*

Request body: any subset of Product fields except `id` and `sku`. Only provided fields are updated.

**Success (200):** the updated Product object. **Error (404):** not found.

---

### `PATCH /api/products/:id/status`
*Toggle product active status*

**Request body:**
```json
{ "active": false }
```

**Success (200):** the updated Product object with the new active value.

---

## 4. Categories API

### `GET /api/categories`
*Return all categories*

**Success (200):**
```json
{ "data": [{ "id": "c1", "name": "Electronics" }] }
```

---

### `POST /api/categories`
*Create a new category*

```json
{ "name": "New Category" }
```

**Success (201):** the created Category object. **Error (409):** name already exists.

---

### `PATCH /api/categories/:id`
*Rename a category*

```json
{ "name": "Renamed Category" }
```

**Success (200):** the updated Category object. All products in this category are updated to the new name.

---

## 5. Orders API

All endpoints in this section are consumed exclusively by `modulus-orders`.

### `GET /api/orders`
*Return a paginated list of orders*

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No (default: 1) | Page number |
| limit | number | No (default: 20) | Items per page |
| status | string | No | One of: pending, processing, shipped, delivered, cancelled |
| search | string | No | Match against order ID or customer email |
| customerId | string | No | Filter by customer ID |

**Success (200):**
```json
{
  "data": [{
    "id": "o1",
    "customerId": "c1",
    "customerEmail": "alice@...",
    "status": "pending",
    "items": [],
    "total": 14999,
    "createdAt": "2025-03-01T10:00:00Z",
    "timeline": [{ "status": "pending", "timestamp": "2025-03-01T10:00:00Z" }]
  }],
  "pagination": { "page": 1, "limit": 20, "total": 500, "totalPages": 25 }
}
```

---

### `GET /api/orders/:id`
*Return a single order by ID*

**Success (200):** the full Order object including all items and timeline. **Error (404):** not found.

---

### `PATCH /api/orders/:id/status`
*Update order status*

**Request body:**
```json
{ "status": "processing" }
```

**Valid status transitions:**

| Current Status | Valid Next Statuses |
|---------------|---------------------|
| pending | processing, cancelled |
| processing | shipped, cancelled |
| shipped | delivered, cancelled |
| delivered | None (terminal state) |
| cancelled | None (terminal state) |

**Success (200):** the updated Order object with the new status appended to timeline.

**Error (422)** if the requested transition is invalid:
```json
{ "error": "Invalid transition", "from": "delivered", "to": "processing" }
```

---

## 6. Customers API

### `GET /api/customers/:id`
*Return a customer by ID*

**Success (200):**
```json
{ "id": "c1", "email": "alice@example.com", "name": "Alice Chen", "totalOrders": 8 }
```

---

### `GET /api/customers`
*Search customers by email*

Query parameter: `email` (required). Returns all customers whose email contains the search string.

**Success (200):**
```json
{ "data": [{ "id": "c1", "email": "alice@example.com", "name": "Alice Chen", "totalOrders": 8 }] }
```

---

## 7. Analytics API

All endpoints are consumed exclusively by `modulus-analytics`. All data is pre-aggregated in the MSW seed.

All analytics endpoints accept `startDate` and `endDate` query parameters (ISO 8601 date strings, both required).

### `GET /api/analytics/summary`
```json
{
  "totalRevenue": 4823600,
  "totalOrders": 482,
  "averageOrderValue": 10007,
  "returnRate": 0.034
}
```

### `GET /api/analytics/revenue`
```json
{ "data": [{ "date": "2025-03-01", "revenue": 182400 }] }
```

### `GET /api/analytics/orders-by-status`
```json
{ "data": [{ "status": "delivered", "count": 210 }] }
```

### `GET /api/analytics/top-products`
```json
{ "data": [{ "productId": "p12", "name": "...", "revenue": 284000, "unitsSold": 142 }] }
```

### `GET /api/analytics/regional`
```json
{ "data": [{ "region": "Northeast", "revenue": 1240000, "orders": 124 }] }
```

---

## 8. Standard Error Responses

All endpoints return errors in this format:
```json
{ "error": "<human-readable message>", "code": "<machine-readable code>" }
```

| HTTP Status | Code | Meaning |
|-------------|------|---------|
| 400 | VALIDATION_ERROR | Request body failed schema validation |
| 401 | UNAUTHORIZED | Missing or malformed Authorization header |
| 403 | FORBIDDEN | Token valid but role lacks permission |
| 404 | NOT_FOUND | Requested resource does not exist |
| 409 | CONFLICT | Resource already exists |
| 422 | INVALID_TRANSITION | State machine transition not permitted |
| 500 | INTERNAL_ERROR | Unexpected MSW handler error |

---

## 9. MSW Handler Implementation Notes

- All handlers are defined in `packages/types/src/handlers.ts` and imported by the shell for MSW initialisation.
- Handler response shapes must match the TypeScript types defined in `packages/types/src/types.ts` exactly. A type change without a corresponding handler update is a compile error.
- Simulated network latency of 300ms to 600ms is applied to all handlers to produce realistic loading states.
- The seed data is generated once at MSW startup and held in module-level variables. Mutations update the in-memory seed. Data resets on page refresh.
- Pagination is performed in the handler, not in the seed data. The handler slices the full array based on `page` and `limit` parameters.
- Error simulation: adding the request header `X-Simulate-Error: true` to any request causes the handler to return a 500 response. This is used in E2E tests to verify error state handling.
