# Postman Collection

This folder contains a ready-to-run Postman setup for the backend API.

## Files

- [Ecommerce_MEAN.postman_collection.json](Ecommerce_MEAN.postman_collection.json)
- [Ecommerce_MEAN.postman_environment.json](Ecommerce_MEAN.postman_environment.json)

## Import Steps

1. Open Postman.
2. Import the collection JSON file.
3. Import the environment JSON file.
4. Select the `Ecommerce Local` environment.
5. Verify `baseUrl` points to your backend, defaulting to `http://localhost:4000`.

## Recommended Run Order

Run the collection from top to bottom:

1. Bootstrap
2. Admin Setup
3. Seller Setup
4. Products
5. Cart
6. Orders
7. Users Account
8. Seller Reports
9. Payments
10. Marketing
11. Admin Ops
12. Notifications

## Notes

- The first request seeds runtime variables such as emails, guest ID, and tokens.
- Most protected routes use Bearer tokens stored in environment variables.
- Some requests depend on earlier IDs like `categoryId`, `productId`, and `orderId`, so keep the run order intact.
- The collection includes both authenticated and guest cart examples.
