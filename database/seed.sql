-- Spice Garden sample seed data

-- Clear existing data so the seed can be safely re-run
TRUNCATE TABLE order_items, orders, customers CASCADE;

-- ==========================================
-- CUSTOMERS
-- ==========================================

INSERT INTO customers (
    id,
    name,
    email,
    phone
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Arjun Kumar',
    'arjun.kumar@gmail.com',
    '9876543210'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Priya Sharma',
    'priya.sharma@gmail.com',
    '9876543211'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Rahul Menon',
    NULL,
    '9876543212'
),
(
    '44444444-4444-4444-4444-444444444444',
    'Ananya Iyer',
    'ananya.iyer@gmail.com',
    '9876543213'
),
(
    '55555555-5555-5555-5555-555555555555',
    'Vikram Reddy',
    'vikram.reddy@gmail.com',
    '9876543214'
);

-- ==========================================
-- ORDERS
-- ==========================================

INSERT INTO orders (
    id,
    order_number,
    customer_id,
    status,
    total_amount,
    item_count
) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ORD-000001',
    '11111111-1111-1111-1111-111111111111',
    'CONFIRMED',
    420.00,
    2
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'ORD-000002',
    '22222222-2222-2222-2222-222222222222',
    'PREPARING',
    580.00,
    3
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'ORD-000003',
    '33333333-3333-3333-3333-333333333333',
    'READY',
    350.00,
    2
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'ORD-000004',
    '44444444-4444-4444-4444-444444444444',
    'COMPLETED',
    760.00,
    4
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'ORD-000005',
    '55555555-5555-5555-5555-555555555555',
    'CANCELLED',
    280.00,
    2
);

-- ==========================================
-- ORDER ITEMS
-- ==========================================

INSERT INTO order_items (
    id,
    order_id,
    item_name,
    quantity,
    unit_price,
    total_price
) VALUES

-- ORD-000001
(
    '10000001-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Paneer Butter Masala',
    1,
    240.00,
    240.00
),
(
    '10000001-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Butter Naan',
    2,
    90.00,
    180.00
),

-- ORD-000002
(
    '10000002-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Chicken Biryani',
    1,
    320.00,
    320.00
),
(
    '10000002-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Chicken 65',
    1,
    180.00,
    180.00
),
(
    '10000002-0000-0000-0000-000000000003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Fresh Lime Soda',
    1,
    80.00,
    80.00
),

-- ORD-000003
(
    '10000003-0000-0000-0000-000000000001',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Masala Dosa',
    2,
    150.00,
    300.00
),
(
    '10000003-0000-0000-0000-000000000002',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Filter Coffee',
    1,
    50.00,
    50.00
),

-- ORD-000004
(
    '10000004-0000-0000-0000-000000000001',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Mutton Biryani',
    2,
    320.00,
    640.00
),
(
    '10000004-0000-0000-0000-000000000002',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Gulab Jamun',
    2,
    60.00,
    120.00
),

-- ORD-000005
(
    '10000005-0000-0000-0000-000000000001',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Veg Fried Rice',
    1,
    180.00,
    180.00
),
(
    '10000005-0000-0000-0000-000000000002',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Gobi Manchurian',
    1,
    100.00,
    100.00
);

