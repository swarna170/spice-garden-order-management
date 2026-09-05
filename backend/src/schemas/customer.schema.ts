import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(1).max(20),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(1).max(20).optional(),
});

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(10),
});