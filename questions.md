Questions & Assumptions

This document records implementation decisions where the assignment does not explicitly define one required behavior.

1. Must an order contain items?

Yes. An order must contain at least one item. Creating an order with zero items returns VALIDATION_FAILED.

2. Can the last item be deleted?

No. The application prevents deleting the final item because an order must always contain at least one item.

3. How are totals calculated?

For each item: totalPrice = quantity × unitPrice.

For an order: totalAmount = sum of item totalPrice values.

Totals are recalculated when items are added or deleted.

4. What does itemCount represent?

itemCount represents the total number of ordered units, calculated from the quantities of all order items.

5. How are customers associated with orders?

If customer.id is provided, the existing customer is used. If customer.id is null, a new customer is created from the supplied details. A non-existent supplied customer ID returns RESOURCE_NOT_FOUND.

6. Is phone number unique?

Yes. Customer phone numbers are unique. A duplicate phone number returns RESOURCE_ALREADY_EXISTS.

7. Is email required?

No. Email is nullable. When supplied, it must be a valid email address.

8. What statuses are supported?

CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED.

9. Which status transitions are allowed?

CONFIRMED → PREPARING
CONFIRMED → CANCELLED
PREPARING → READY
PREPARING → CANCELLED
READY → COMPLETED
READY → CANCELLED

COMPLETED and CANCELLED are terminal states.

10. What happens on an invalid status transition?

The API returns INVALID_STATUS_TRANSITION.

11. What are the pagination defaults?

Default page: 1
Default size: 10
Maximum size: 100

Invalid page or size values return INVALID_FILTER.

12. How does search work?

The orders endpoint supports a search parameter for order/customer-related searchable information. Status and customer filters can also be combined with search.

13. What happens when a referenced resource does not exist?

Missing customers, orders, or order items return RESOURCE_NOT_FOUND.

14. What item prices are accepted?

The application requires a price greater than zero. Missing, non-numeric, zero, or negative prices are rejected as invalid input.

15. What quantities are accepted?

Quantity must be a positive integer. For example, 1 and 2 are valid; 0, negative values, and decimals are invalid.

16. Why use routes/controllers/services?

The backend follows Route → Controller → Service → Database. This separates HTTP handling, business logic, and persistence responsibilities.

17. How are credentials handled?

Database credentials are stored in environment variables. Only backend/.env.example should be committed. The real .env must never be submitted.

18. Why is Docker included?

Docker provides a consistent local PostgreSQL environment for running the application.

19. What does the seed file provide?

database/seed.sql provides sample customers, orders, and order items so the application can be tested immediately.

20. What should not be included in the submission?

Do not include:

.env
node_modules/
dist/

Only source code, required configuration/examples, database scripts, and documentation should be submitted.