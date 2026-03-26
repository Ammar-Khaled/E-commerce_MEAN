# Ecommerce Backend API

Express backend for an ecommerce platform with MongoDB persistence (Mongoose) and JWT authentication.

## What Has Been Implemented


- Core ecommerce API modules implemented:
  - Auth
  - Users
  - Products and reviews
  - Cart and checkout
  - Orders
  - Payments (mock)
  - Admin
  - Seller
  - Notifications
  - Marketing

## Tech Stack

- Node.js
- Express 5
- MongoDB
- Mongoose
- JWT
- bcryptjs
- morgan
- cors
- dotenv

## Project Startup

1. Open terminal in backend folder.
2. Run npm install.
3. Ensure MongoDB is running locally or provide MONGO_URI.
4. Start server with npm start.
5. API base URL: http://localhost:4000

## Environment Variables

- MONGO_URI
  - Optional
  - Default: mongodb://127.0.0.1:27017/ecommerce
- JWT_SECRET
  - Required
  - Used for signing and verifying JWTs
- JWT_EXPIRES_IN
  - Recommended
  - Token lifetime, for example 7d
- PORT
  - Optional
  - Default: 4000

## Authentication

- Obtain token via:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/social/google
- Send token in protected endpoints:
  - Authorization: Bearer YOUR_TOKEN

## Seeded Users

- Admin
  - id: 1
  - email: admin@shop.local
  - password: admin123
- Seller
  - id: 2
  - email: seller@shop.local
  - password: seller123
- Customer
  - id: 3
  - email: customer@shop.local
  - password: customer123

## Endpoint Catalog

### Health

- GET /api/health
  - Auth: Public
  - Description: Service health check

### Auth

- POST /api/auth/register
  - Auth: Public
  - Body: name, email, password, optional phone, optional role
  - Returns: JWT token and user profile
- POST /api/auth/login
  - Auth: Public
  - Body: email, password
  - Returns: JWT token and user profile
- POST /api/auth/social/google
  - Auth: Public
  - Body: email, optional name
  - Returns: JWT token and user profile

### Users

- GET /api/users/me
  - Auth: Bearer token
  - Description: Current user profile
- PATCH /api/users/me
  - Auth: Bearer token
  - Body: optional name, address, phone, paymentDetails
  - Description: Update profile
- GET /api/users/me/wishlist
  - Auth: Bearer token
  - Description: Get wishlist products
- POST /api/users/me/wishlist/:productId
  - Auth: Bearer token
  - Description: Add product to wishlist
- DELETE /api/users/me/wishlist/:productId
  - Auth: Bearer token
  - Description: Remove product from wishlist
- GET /api/users/me/favorites
  - Auth: Bearer token
  - Description: Alias of wishlist items
- GET /api/users/me/orders
  - Auth: Bearer token
  - Description: Current user orders
- GET /api/users/me/reviews
  - Auth: Bearer token
  - Description: Current user reviews
- GET /api/users/roles
  - Auth: Public
  - Description: Available roles
- GET /api/users/all
  - Auth: Public in current implementation
  - Description: List users not soft-deleted

### Products

- GET /api/products/categories
  - Auth: Public
  - Description: Categories list
- GET /api/products
  - Auth: Public
  - Query: q, categoryId, minPrice, maxPrice, inStock, sellerId, sort
  - Description: Product search and filtering
- GET /api/products/:id
  - Auth: Public
  - Description: Product detail with review metadata
- POST /api/products
  - Auth: Seller or Admin
  - Body: name, price, categoryId, optional description, stock, images
  - Description: Create product
- PATCH /api/products/:id/stock
  - Auth: Seller or Admin
  - Body: stock
  - Description: Update stock
- GET /api/products/:id/reviews
  - Auth: Public
  - Description: Product reviews
- POST /api/products/:id/reviews
  - Auth: Bearer token
  - Body: rating, optional comment
  - Description: Add review

### Cart

- GET /api/cart
  - Auth: Public or Bearer token
  - Description: Current cart with totals
- POST /api/cart
  - Auth: Public or Bearer token
  - Body: productId, optional quantity
  - Description: Add item
- POST /api/cart/items
  - Auth: Public or Bearer token
  - Body: productId, optional quantity
  - Description: Add item (same behavior as POST /api/cart)
- PATCH /api/cart/items/:productId
  - Auth: Public or Bearer token
  - Body: quantity
  - Description: Update item quantity
- DELETE /api/cart/:productId
  - Auth: Public or Bearer token
  - Description: Remove item
- POST /api/cart/promo
  - Auth: Public or Bearer token
  - Body: code
  - Description: Apply promo code
- GET /api/cart/summary
  - Auth: Public or Bearer token
  - Description: Price breakdown
- POST /api/cart/checkout
  - Auth: Public or Bearer token
  - Body: optional paymentMethod, shippingAddress, guestInfo
  - Description: Place order and clear cart

Guest cart note:
- Guest cart identity uses x-guest-id header, guestId query, or guestId in body.
- If none are provided, fallback guest id is default.

### Orders

- GET /api/orders
  - Auth: Bearer token
  - Description: Role-based orders list
- GET /api/orders/:id
  - Auth: Bearer token
  - Description: Order details with access checks
- PATCH /api/orders/:id/status
  - Auth: Admin or Seller on that order
  - Body: status
  - Description: Update order status and create notification

### Payments (Mock)

- GET /api/payments/methods
  - Auth: Public
  - Description: Supported payment methods
- POST /api/payments/intent
  - Auth: Public
  - Body: method, amount, optional currency
  - Description: Create mock payment intent

### Admin

- GET /api/admin/dashboard
  - Auth: Admin
  - Description: Dashboard counts
- GET /api/admin/users
  - Auth: Admin
  - Description: List all users
- PATCH /api/admin/users/:id/restrict
  - Auth: Admin
  - Body: isActive
  - Description: Restrict or enable user
- DELETE /api/admin/users/:id
  - Auth: Admin
  - Description: Soft delete user
- POST /api/admin/categories
  - Auth: Admin
  - Body: name
  - Description: Create category
- POST /api/admin/products
  - Auth: Admin
  - Body: name, price, categoryId, optional description, stock, sellerId
  - Description: Create product
- PATCH /api/admin/orders/:id/shipping
  - Auth: Admin
  - Body: shippingStatus
  - Description: Update shipping status
- GET /api/admin/promos
  - Auth: Admin
  - Description: List promo codes
- POST /api/admin/promos
  - Auth: Admin
  - Body: code, optional discountType, discountValue
  - Description: Create promo code
- PATCH /api/admin/promos/:code/disable
  - Auth: Admin
  - Description: Disable promo code
- GET /api/admin/banners
  - Auth: Admin
  - Description: List banners
- POST /api/admin/banners
  - Auth: Admin
  - Body: title, image, optional isActive
  - Description: Create banner

### Seller

- POST /api/seller/register
  - Auth: Bearer token
  - Body: storeName, optional payoutMethod
  - Description: Register seller profile and set user role to seller
- GET /api/seller/me/profile
  - Auth: Seller or Admin
  - Description: Get seller profile
- PATCH /api/seller/me/profile
  - Auth: Seller or Admin
  - Body: optional storeName, payoutMethod, isApproved (admin usage)
  - Description: Update seller profile
- GET /api/seller/me/products
  - Auth: Seller or Admin
  - Description: Seller products
- POST /api/seller/me/products
  - Auth: Seller or Admin
  - Body: name, price, categoryId, optional description, stock, images
  - Description: Create seller product
- PATCH /api/seller/me/products/:id
  - Auth: Seller or Admin
  - Body: optional name, description, price, stock, images
  - Description: Update seller product
- GET /api/seller/me/orders
  - Auth: Seller or Admin
  - Description: Orders containing seller items
- GET /api/seller/me/earnings
  - Auth: Seller or Admin
  - Description: Seller gross earnings summary

### Notifications

- GET /api/notifications
  - Auth: Bearer token
  - Description: Current user notifications
- POST /api/notifications/email
  - Auth: Admin
  - Body: userId, optional subject, optional message
  - Description: Queue mock email notification

### Marketing

- GET /api/marketing/promotions
  - Auth: Public
  - Description: Active promo codes and banners
- POST /api/marketing/newsletter/subscribe
  - Auth: Public
  - Body: email
  - Description: Add newsletter subscriber
- POST /api/marketing/loyalty/reward
  - Auth: Admin
  - Body: userId, optional points
  - Description: Increment loyalty points

## Notes and Current Status

- Persistence is fully MongoDB-based using Mongoose models.
- JWT auth is active and x-user-id authentication is removed.
- Some route files still use store helper imports while model/controller refactor is partially in progress.
- Payments, Google social auth, and notifications are currently mock integrations.
- This backend is production-oriented in structure but still requires hardening for deployment.

If you want, I can do a second pass to generate a shorter “public API quick reference” section at the top for frontend developers.