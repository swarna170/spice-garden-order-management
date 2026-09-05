-- ============================================================
-- Spice Garden Restaurant Order Management System
-- PostgreSQL Database Schema
-- ============================================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255),

    phone VARCHAR(20) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ORDER STATUS ENUM
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'order_status'
    ) THEN
        CREATE TYPE order_status AS ENUM (
            'CONFIRMED',
            'PREPARING',
            'READY',
            'COMPLETED',
            'CANCELLED'
        );
    END IF;
END
$$;


-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_number VARCHAR(30) NOT NULL UNIQUE,

    customer_id UUID NOT NULL
        REFERENCES customers(id),

    status order_status NOT NULL DEFAULT 'CONFIRMED',

    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0
        CHECK (total_amount >= 0),

    item_count INTEGER NOT NULL DEFAULT 0
        CHECK (item_count >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    item_name VARCHAR(150) NOT NULL,

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    unit_price NUMERIC(10, 2) NOT NULL
        CHECK (unit_price >= 0),

    total_price NUMERIC(10, 2) NOT NULL
        CHECK (total_price >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_customers_phone
    ON customers(phone);

CREATE INDEX IF NOT EXISTS idx_customers_name
    ON customers(name);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id
    ON orders(customer_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
    ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
    ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
    ON order_items(order_id);


-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE customers IS
    'Stores restaurant customer information';

COMMENT ON TABLE orders IS
    'Stores restaurant orders and their current status';

COMMENT ON TABLE order_items IS
    'Stores individual items belonging to an order';

COMMENT ON COLUMN orders.total_amount IS
    'Sum of quantity multiplied by unit price for all order items';

COMMENT ON COLUMN orders.item_count IS
    'Total quantity of items in the order';
