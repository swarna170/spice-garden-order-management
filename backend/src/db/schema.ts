import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

/* =========================
   ORDER STATUS
========================= */

export const orderStatusEnum = pgEnum("order_status", [
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
]);

/* =========================
   CUSTOMERS
========================= */

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", {
    length: 100,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  }),

  phone: varchar("phone", {
    length: 20,
  })
    .notNull()
    .unique(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   ORDERS
========================= */

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  orderNumber: varchar("order_number", {
    length: 30,
  })
    .notNull()
    .unique(),

  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),

  status: orderStatusEnum("status")
    .notNull()
    .default("CONFIRMED"),

  totalAmount: numeric("total_amount", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0"),

  itemCount: integer("item_count")
    .notNull()
    .default(0),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   ORDER ITEMS
========================= */

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, {
      onDelete: "cascade",
    }),

  itemName: varchar("item_name", {
    length: 150,
  }).notNull(),

  quantity: integer("quantity").notNull(),

  unitPrice: numeric("unit_price", {
    precision: 10,
    scale: 2,
  }).notNull(),

  totalPrice: numeric("total_price", {
    precision: 10,
    scale: 2,
  }).notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================
   RELATIONS
========================= */

export const customerRelations = relations(
  customers,
  ({ many }) => ({
    orders: many(orders),
  })
);

export const orderRelations = relations(
  orders,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [orders.customerId],
      references: [customers.id],
    }),

    items: many(orderItems),
  })
);

export const orderItemRelations = relations(
  orderItems,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
    }),
  })
);