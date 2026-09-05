import { count, eq, ilike, or } from "drizzle-orm";
import { db } from "../db";
import { customers } from "../db/schema";

export async function getCustomers(
  search: string | undefined,
  page: number,
  size: number
) {
  const offset = (page - 1) * size;

  const whereCondition = search
    ? or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.email, `%${search}%`),
        ilike(customers.phone, `%${search}%`)
      )
    : undefined;

  const data = await db
    .select()
    .from(customers)
    .where(whereCondition)
    .limit(size)
    .offset(offset)
    .orderBy(customers.createdAt);

  const totalResult = await db
    .select({ count: count() })
    .from(customers)
    .where(whereCondition);

  const total = Number(totalResult[0]?.count ?? 0);

  return {
    data,
    pagination: {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    },
  };
}

export async function getCustomerById(id: string) {
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function createCustomer(data: {
  name: string;
  email?: string | null;
  phone: string;
}) {
  const existing = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, data.phone))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("RESOURCE_ALREADY_EXISTS");
  }

  const result = await db
    .insert(customers)
    .values({
      name: data.name,
      email: data.email ?? null,
      phone: data.phone,
    })
    .returning();

  return result[0];
}

export async function updateCustomer(
  id: string,
  data: {
    name?: string;
    email?: string | null;
    phone?: string;
  }
) {
  const existingCustomer = await getCustomerById(id);

  if (!existingCustomer) {
    throw new Error("RESOURCE_NOT_FOUND");
  }

  if (data.phone && data.phone !== existingCustomer.phone) {
    const duplicate = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, data.phone))
      .limit(1);

    if (duplicate.length > 0) {
      throw new Error("RESOURCE_ALREADY_EXISTS");
    }
  }

  const result = await db
    .update(customers)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning();

  return result[0];
}

export async function deleteCustomer(id: string) {
  const existingCustomer = await getCustomerById(id);

  if (!existingCustomer) {
    throw new Error("RESOURCE_NOT_FOUND");
  }

  await db
    .delete(customers)
    .where(eq(customers.id, id));
}
