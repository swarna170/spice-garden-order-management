import { z } from "zod";

export const orderStatusSchema = z.enum([
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
]);

export const orderQuerySchema = z.object({
  search: z.string().optional(),

  status: orderStatusSchema.optional(),

  customerId: z.string().optional(),

  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  size: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),
});

/*
 * Order item validation
 *
 * quantity:
 * - must be an integer
 * - must be greater than 0
 *
 * unitPrice:
 * - must be a number
 * - must be greater than 0
 *
 * This prevents orders such as:
 * quantity = 1
 * unitPrice = 0
 */
export const orderItemSchema = z.object({
  itemName: z.string().min(1).max(150),

  quantity: z
    .number()
    .int()
    .positive(),

  unitPrice: z
    .number()
    .positive(),
});

/*
 * Create Order
 *
 * At least ONE item is mandatory.
 */
export const createOrderSchema = z.object({
  customer: z.object({
    id: z.string().nullable(),
    name: z.string().min(1).max(100),
    email: z.string().email().nullable(),
    phone: z.string().min(1).max(20),
  }),

  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export const addOrderItemSchema = orderItemSchema;