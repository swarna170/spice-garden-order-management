Spice Garden Restaurant Order Management System

A full-stack restaurant order management application for creating, viewing, searching, filtering, and updating restaurant orders and associated customer information.

Features

Create and manage customers

Create orders with one or more items

View order and customer details

Search and paginate orders

Filter orders by status and customer

Update order status with controlled transitions

Add and delete order items

Automatic item and order total calculations

Zod request validation and structured API errors

Tech Stack

Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Lucide React
Backend: Node.js, TypeScript, Hono, Zod, Drizzle ORM
Database: PostgreSQL, Docker

Project Structure

spice-garden-order-management/
├── frontend/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── .env.example
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docker-compose.yml
├── questions.md
└── README.md

Architecture

HTTP Request
     ↓
Route
     ↓
Controller
     ↓
Service
     ↓
Drizzle ORM
     ↓
PostgreSQL

Prerequisites

Node.js 18+

npm

Docker Desktop

Git

Local Setup

1. Clone

git clone <repository-url>
cd spice-garden-order-management

2. Start PostgreSQL

docker compose up -d

Default local database:

Host: localhost
Port: 5432
Database: spice_garden
User: postgres
Password: postgres

3. Create schema and seed data

Execute these files against the local PostgreSQL database:

database/schema.sql
database/seed.sql

With psql:

psql postgresql://postgres:postgres@localhost:5432/spice_garden -f database/schema.sql
psql postgresql://postgres:postgres@localhost:5432/spice_garden -f database/seed.sql

4. Configure backend

Create backend/.env from backend/.env.example:

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/spice_garden
PORT=3000

Do not commit .env.

5. Run backend

cd backend
npm install
npm run dev

Production build:

npm run build
npm start

API:

http://localhost:3000

6. Run frontend

In another terminal:

cd frontend
npm install
npm run dev

Open the Vite URL shown in the terminal, normally http://localhost:5173.

API Endpoints

Customers

Method

Endpoint

Purpose

GET

/customers

List/search customers with pagination

POST

/customers

Create customer

PATCH

/customers/{id}

Update customer

DELETE

/customers/{id}

Delete customer

Orders

Method

Endpoint

Purpose

GET

/orders

List/search/filter orders

GET

/orders/{order_id}

Get order details

POST

/orders

Create order

PATCH

/orders/{order_id}/status

Update status

POST

/orders/{order_id}/items

Add item

DELETE

/orders/{order_id}/items/{item_id}

Delete item

Order query parameters:

search, status, customerId, page, size

Order Status Flow

CONFIRMED → PREPARING → READY → COMPLETED
     ↓          ↓          ↓
 CANCELLED   CANCELLED   CANCELLED

COMPLETED and CANCELLED are terminal states.

Validation and Errors

Common error codes:

VALIDATION_FAILED

RESOURCE_NOT_FOUND

RESOURCE_ALREADY_EXISTS

INVALID_FILTER

INVALID_STATUS_TRANSITION

INTERNAL_SERVER_ERROR

Error format:

{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request data"
  }
}

Calculations

item total = quantity × unitPrice
order total = sum of item totals

Totals and item counts are recalculated when order items change.

Database

The database contains:

customers

orders

order_items

orders.customer_id references customers.id.
order_items.order_id references orders.id with cascade deletion.

Health Check

GET /health

Expected response:

{
  "status": "ok",
  "database": "connected"
}

Build Verification

Backend:

cd backend
npm run build

Frontend:

cd frontend
npm run build

Assumptions

Implementation decisions and assumptions are documented in questions.md.

Submission Checklist

frontend/ included

backend/ included

database/schema.sql included

database/seed.sql included

README.md included

questions.md included

No .env files

No node_modules/

No dist/

Backend build succeeds

Frontend build succeeds

PostgreSQL starts successfully

Seed data loads successfully