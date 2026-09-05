import {
  and,
  count,
  desc,
  eq,
  ilike,
  or,
  SQL,
} from "drizzle-orm";

import { db } from "../db";

import {
  customers,
  orderItems,
  orders,
} from "../db/schema";

type OrderStatus =
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

type OrderItemInput = {
  itemName: string;
  quantity: number;
  unitPrice: number;
};

type CreateOrderInput = {
  customer: {
    id: string | null;
    name: string;
    email: string | null;
    phone: string;
  };

  items: OrderItemInput[];
};

/* =========================================================
   FORMAT ORDER
========================================================= */

function formatOrder(
  order: any,
  customer: any,
  items: any[]
) {
  return {
    ...order,

    totalAmount: Number(order.totalAmount),

    itemCount: Number(order.itemCount),

    customer,

    items: items.map((item) => ({
      ...item,

      quantity: Number(item.quantity),

      unitPrice: Number(item.unitPrice),

      totalPrice: Number(item.totalPrice),
    })),
  };
}

/* =========================================================
   ORDER NUMBER GENERATOR
========================================================= */

async function generateOrderNumber() {
  const result = await db
    .select({
      count: count(),
    })
    .from(orders);

  const nextNumber =
    Number(result[0]?.count ?? 0) + 1;

  return `ORD-${String(nextNumber).padStart(6, "0")}`;
}

/* =========================================================
   LIST ORDERS
========================================================= */

export async function getOrders(
  search: string | undefined,
  status: OrderStatus | undefined,
  customerId: string | undefined,
  page: number,
  size: number
) {
  /*
   * If customerId was supplied, make sure that
   * customer actually exists.
   */
  if (customerId) {
    const customer = await db
      .select({
        id: customers.id,
      })
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (customer.length === 0) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }
  }

  const offset = (page - 1) * size;

  const conditions: SQL[] = [];

  /* ---------------- SEARCH ---------------- */

  if (search) {
    const searchCondition = or(
      ilike(
        orders.orderNumber,
        `%${search}%`
      ),

      ilike(
        customers.name,
        `%${search}%`
      ),

      ilike(
        customers.phone,
        `%${search}%`
      )
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  /* ---------------- STATUS ---------------- */

  if (status) {
    conditions.push(
      eq(orders.status, status)
    );
  }

  /* ---------------- CUSTOMER ---------------- */

  if (customerId) {
    conditions.push(
      eq(orders.customerId, customerId)
    );
  }

  const whereCondition =
    conditions.length > 0
      ? and(...conditions)
      : undefined;

  /* ---------------- ORDERS ---------------- */

  const rows = await db
    .select({
      order: orders,
      customer: customers,
    })
    .from(orders)
    .innerJoin(
      customers,
      eq(
        orders.customerId,
        customers.id
      )
    )
    .where(whereCondition)
    .orderBy(desc(orders.createdAt))
    .limit(size)
    .offset(offset);

  /* ---------------- TOTAL COUNT ---------------- */

  const totalResult = await db
    .select({
      count: count(),
    })
    .from(orders)
    .innerJoin(
      customers,
      eq(
        orders.customerId,
        customers.id
      )
    )
    .where(whereCondition);

  const total = Number(
    totalResult[0]?.count ?? 0
  );

  /* ---------------- NEST ITEMS ---------------- */

  const data = await Promise.all(
    rows.map(
      async ({ order, customer }) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(
            eq(
              orderItems.orderId,
              order.id
            )
          );

        return formatOrder(
          order,
          customer,
          items
        );
      }
    )
  );

  return {
    data,

    pagination: {
      page,
      size,
      total,
      totalPages: Math.ceil(
        total / size
      ),
    },
  };
}

/* =========================================================
   GET SINGLE ORDER
========================================================= */

export async function getOrderById(
  id: string
) {
  const result = await db
    .select({
      order: orders,
      customer: customers,
    })
    .from(orders)
    .innerJoin(
      customers,
      eq(
        orders.customerId,
        customers.id
      )
    )
    .where(eq(orders.id, id))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(
      eq(orderItems.orderId, id)
    );

  return formatOrder(
    result[0].order,
    result[0].customer,
    items
  );
}

/* =========================================================
   CREATE ORDER
========================================================= */

export async function createOrder(
  data: CreateOrderInput
) {
  /*
   * BACKEND BUSINESS RULE:
   *
   * An order must contain at least
   * one item.
   *
   * This check is intentionally here
   * even though Zod also validates it.
   */
  if (
    !data.items ||
    data.items.length === 0
  ) {
    throw new Error(
      "ORDER_MUST_HAVE_ITEMS"
    );
  }

  /*
   * Validate every item again at the
   * service/business layer.
   *
   * This protects the database even if
   * another caller bypasses the HTTP
   * controller.
   */
  for (const item of data.items) {
    if (
      !item.itemName ||
      item.quantity <= 0 ||
      !Number.isInteger(item.quantity) ||
      item.unitPrice <= 0 ||
      !Number.isFinite(item.unitPrice)
    ) {
      throw new Error(
        "INVALID_ORDER_ITEM"
      );
    }
  }

  /*
   * Only return the order ID from inside
   * the transaction.
   *
   * The complete order is fetched after
   * the transaction commits.
   */

  const orderId = await db.transaction(
    async (tx) => {
      let customerId: string;

      /* =========================================
         EXISTING CUSTOMER
      ========================================= */

      if (data.customer.id) {
        const existingCustomer =
          await tx
            .select()
            .from(customers)
            .where(
              eq(
                customers.id,
                data.customer.id
              )
            )
            .limit(1);

        if (
          existingCustomer.length === 0
        ) {
          throw new Error(
            "CUSTOMER_NOT_FOUND"
          );
        }

        customerId =
          existingCustomer[0].id;
      }

      /* =========================================
         NEW CUSTOMER
      ========================================= */

      else {
        const phoneMatch =
          await tx
            .select()
            .from(customers)
            .where(
              eq(
                customers.phone,
                data.customer.phone
              )
            )
            .limit(1);

        if (phoneMatch.length > 0) {
          throw new Error(
            "RESOURCE_ALREADY_EXISTS"
          );
        }

        const newCustomer =
          await tx
            .insert(customers)
            .values({
              name: data.customer.name,

              email:
                data.customer.email,

              phone:
                data.customer.phone,
            })
            .returning();

        customerId =
          newCustomer[0].id;
      }

      /* =========================================
         ORDER NUMBER
      ========================================= */

      const orderNumber =
        await generateOrderNumber();

      /* =========================================
         CALCULATE TOTAL
      ========================================= */

      const totalAmount =
        data.items.reduce(
          (sum, item) =>
            sum +
            item.quantity *
              item.unitPrice,

          0
        );

      /* =========================================
         CALCULATE ITEM COUNT
      ========================================= */

      const itemCount =
        data.items.reduce(
          (sum, item) =>
            sum + item.quantity,

          0
        );

      /* =========================================
         CREATE ORDER
      ========================================= */

      const createdOrder =
        await tx
          .insert(orders)
          .values({
            orderNumber,

            customerId,

            status: "CONFIRMED",

            totalAmount:
              totalAmount.toFixed(2),

            itemCount,
          })
          .returning({
            id: orders.id,
          });

      const order =
        createdOrder[0];

      /* =========================================
         CREATE ORDER ITEMS
      ========================================= */

      await tx
        .insert(orderItems)
        .values(
          data.items.map((item) => ({
            orderId: order.id,

            itemName:
              item.itemName,

            quantity:
              item.quantity,

            unitPrice:
              item.unitPrice.toFixed(2),

            totalPrice: (
              item.quantity *
              item.unitPrice
            ).toFixed(2),
          }))
        );

      return order.id;
    }
  );

  /* =========================================
     FETCH COMPLETE ORDER
  ========================================= */

  const createdOrder =
    await getOrderById(orderId);

  if (!createdOrder) {
    throw new Error(
      "ORDER_CREATION_FAILED"
    );
  }

  return createdOrder;
}

/* =========================================================
   STATUS TRANSITIONS
========================================================= */

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  CONFIRMED: [
    "PREPARING",
    "CANCELLED",
  ],

  PREPARING: [
    "READY",
    "CANCELLED",
  ],

  READY: [
    "COMPLETED",
    "CANCELLED",
  ],

  COMPLETED: [],

  CANCELLED: [],
};

/* =========================================================
   UPDATE STATUS
========================================================= */

export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus
) {
  const currentOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (currentOrder.length === 0) {
    throw new Error(
      "RESOURCE_NOT_FOUND"
    );
  }

  const currentStatus =
    currentOrder[0].status as OrderStatus;

  if (
    !allowedTransitions[
      currentStatus
    ].includes(newStatus)
  ) {
    throw new Error(
      "INVALID_STATUS_TRANSITION"
    );
  }

  await db
    .update(orders)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id));

  return getOrderById(id);
}

/* =========================================================
   RECALCULATE ORDER TOTALS
========================================================= */

async function recalculateOrder(
  orderId: string
) {
  const items = await db
    .select()
    .from(orderItems)
    .where(
      eq(
        orderItems.orderId,
        orderId
      )
    );

  /*
   * There should never be zero items
   * because deleteOrderItem prevents
   * deleting the final item.
   */

  if (items.length === 0) {
    throw new Error(
      "ORDER_MUST_HAVE_ITEMS"
    );
  }

  const totalAmount =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.totalPrice),

      0
    );

  const itemCount =
    items.reduce(
      (sum, item) =>
        sum + item.quantity,

      0
    );

  await db
    .update(orders)
    .set({
      totalAmount:
        totalAmount.toFixed(2),

      itemCount,

      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));
}

/* =========================================================
   ADD ORDER ITEM
========================================================= */

export async function addOrderItem(
  orderId: string,
  item: OrderItemInput
) {
  /* Validate item */

  if (
    !item.itemName ||
    item.quantity <= 0 ||
    !Number.isInteger(item.quantity) ||
    item.unitPrice <= 0 ||
    !Number.isFinite(item.unitPrice)
  ) {
    throw new Error(
      "INVALID_ORDER_ITEM"
    );
  }

  /* Check order */

  const existingOrder =
    await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

  if (existingOrder.length === 0) {
    throw new Error(
      "RESOURCE_NOT_FOUND"
    );
  }

  /* Insert item */

  await db
    .insert(orderItems)
    .values({
      orderId,

      itemName:
        item.itemName,

      quantity:
        item.quantity,

      unitPrice:
        item.unitPrice.toFixed(2),

      totalPrice: (
        item.quantity *
        item.unitPrice
      ).toFixed(2),
    });

  /* Recalculate order */

  await recalculateOrder(
    orderId
  );

  return getOrderById(orderId);
}

/* =========================================================
   DELETE ORDER ITEM
========================================================= */

export async function deleteOrderItem(
  orderId: string,
  itemId: string
) {
  /* =========================================
     CHECK ORDER
  ========================================= */

  const existingOrder =
    await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

  if (existingOrder.length === 0) {
    throw new Error(
      "RESOURCE_NOT_FOUND"
    );
  }

  /* =========================================
     CHECK ITEM
  ========================================= */

  const existingItem =
    await db
      .select()
      .from(orderItems)
      .where(
        and(
          eq(
            orderItems.id,
            itemId
          ),

          eq(
            orderItems.orderId,
            orderId
          )
        )
      )
      .limit(1);

  if (existingItem.length === 0) {
    throw new Error(
      "ITEM_NOT_FOUND"
    );
  }

  /* =========================================
     IMPORTANT:
     DO NOT ALLOW LAST ITEM TO BE DELETED
  ========================================= */

  const allItems =
    await db
      .select({
        id: orderItems.id,
      })
      .from(orderItems)
      .where(
        eq(
          orderItems.orderId,
          orderId
        )
      );

  if (allItems.length <= 1) {
    throw new Error(
      "ORDER_MUST_HAVE_ITEMS"
    );
  }

  /* =========================================
     DELETE ITEM
  ========================================= */

  await db
    .delete(orderItems)
    .where(
      and(
        eq(
          orderItems.id,
          itemId
        ),

        eq(
          orderItems.orderId,
          orderId
        )
      )
    );

  /* =========================================
     RECALCULATE ORDER
  ========================================= */

  await recalculateOrder(
    orderId
  );

  /* =========================================
     RETURN UPDATED ORDER
  ========================================= */

  const updatedOrder =
    await getOrderById(orderId);

  if (!updatedOrder) {
    throw new Error(
      "ORDER_CREATION_FAILED"
    );
  }

  return updatedOrder;
}