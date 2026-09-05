import { Context } from "hono";

import {
  addOrderItemSchema,
  createOrderSchema,
  orderQuerySchema,
  updateOrderStatusSchema,
} from "../schemas/order.schema";

import * as orderService from "../services/order.service";

/* =========================================================
   LIST ORDERS
========================================================= */

export async function listOrders(
  c: Context
) {
  try {
    const query =
      orderQuerySchema.parse({
        search:
          c.req.query("search"),

        status:
          c.req.query("status"),

        customerId:
          c.req.query("customerId"),

        page:
          c.req.query("page"),

        size:
          c.req.query("size"),
      });

    const result =
      await orderService.getOrders(
        query.search,
        query.status,
        query.customerId,
        query.page,
        query.size
      );

    return c.json({
      data: result.data,

      meta: {
        pagination:
          result.pagination,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "ZodError"
    ) {
      return c.json(
        {
          error: {
            code: "INVALID_FILTER",

            message:
              "Invalid search, status, page, size, or customerId filter",
          },
        },
        400
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "CUSTOMER_NOT_FOUND"
    ) {
      return c.json(
        {
          error: {
            code: "RESOURCE_NOT_FOUND",

            message:
              "Customer not found",
          },
        },
        404
      );
    }

    throw error;
  }
}

/* =========================================================
   GET ORDER
========================================================= */

export async function getOrder(
  c: Context
) {
  const id =
    c.req.param("id");

  if (!id) {
    return c.json(
      {
        error: {
          code: "RESOURCE_NOT_FOUND",

          message:
            "Order ID is required",
        },
      },
      404
    );
  }

  const order =
    await orderService.getOrderById(
      id
    );

  if (!order) {
    return c.json(
      {
        error: {
          code: "RESOURCE_NOT_FOUND",

          message:
            "Order not found",
        },
      },
      404
    );
  }

  return c.json({
    data: order,
  });
}

/* =========================================================
   CREATE ORDER
========================================================= */

export async function createOrder(
  c: Context
) {
  try {
    const body =
      await c.req.json();

    const data =
      createOrderSchema.parse(
        body
      );

    const order =
      await orderService.createOrder(
        data
      );

    return c.json(
      {
        data: order,
      },
      201
    );
  } catch (error) {
    /* ---------------- ZOD ---------------- */

    if (
      error instanceof Error &&
      error.name === "ZodError"
    ) {
      return c.json(
        {
          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "Invalid order data. Customer details and at least one valid item are required.",
          },
        },
        400
      );
    }

    /* ---------------- NO ITEMS ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "ORDER_MUST_HAVE_ITEMS"
    ) {
      return c.json(
        {
          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "An order must contain at least one item",
          },
        },
        400
      );
    }

    /* ---------------- INVALID ITEM ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_ORDER_ITEM"
    ) {
      return c.json(
        {
          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "Each item must have a valid name, quantity greater than 0, and price greater than 0",
          },
        },
        400
      );
    }

    /* ---------------- CUSTOMER ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "CUSTOMER_NOT_FOUND"
    ) {
      return c.json(
        {
          error: {
            code:
              "RESOURCE_NOT_FOUND",

            message:
              "Customer not found",
          },
        },
        404
      );
    }

    /* ---------------- DUPLICATE ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "RESOURCE_ALREADY_EXISTS"
    ) {
      return c.json(
        {
          error: {
            code:
              "RESOURCE_ALREADY_EXISTS",

            message:
              "A customer with this phone already exists",
          },
        },
        409
      );
    }

    /* ---------------- CREATION FAILURE ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "ORDER_CREATION_FAILED"
    ) {
      return c.json(
        {
          error: {
            code:
              "INTERNAL_SERVER_ERROR",

            message:
              "Unable to create order",
          },
        },
        500
      );
    }

    throw error;
  }
}

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

export async function updateStatus(
  c: Context
) {
  try {
    const id =
      c.req.param("id");

    if (!id) {
      return c.json(
        {
          error: {
            code:
              "RESOURCE_NOT_FOUND",

            message:
              "Order ID is required",
          },
        },
        404
      );
    }

    const body =
      await c.req.json();

    const data =
      updateOrderStatusSchema.parse(
        body
      );

    const order =
      await orderService.updateOrderStatus(
        id,
        data.status
      );

    return c.json({
      data: order,
    });
  } catch (error) {
    /* ---------------- VALIDATION ---------------- */

    if (
      error instanceof Error &&
      error.name === "ZodError"
    ) {
      return c.json(
        {
          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "Invalid order status",
          },
        },
        400
      );
    }

    /* ---------------- NOT FOUND ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "RESOURCE_NOT_FOUND"
    ) {
      return c.json(
        {
          error: {
            code:
              "RESOURCE_NOT_FOUND",

            message:
              "Order not found",
          },
        },
        404
      );
    }

    /* ---------------- INVALID TRANSITION ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_STATUS_TRANSITION"
    ) {
      return c.json(
        {
          error: {
            code:
              "INVALID_STATUS_TRANSITION",

            message:
              "The requested status transition is not allowed",
          },
        },
        400
      );
    }

    throw error;
  }
}

/* =========================================================
   ADD ITEM
========================================================= */

export async function addItem(
  c: Context
) {
  try {
    const id =
      c.req.param("id");

    if (!id) {
      return c.json(
        {
          error: {
            code:
              "RESOURCE_NOT_FOUND",

            message:
              "Order ID is required",
          },
        },
        404
      );
    }

    const body =
      await c.req.json();

    const item =
      addOrderItemSchema.parse(
        body
      );

    const order =
      await orderService.addOrderItem(
        id,
        item
      );

    return c.json(
      {
        data: order,
      },
      201
    );
  } catch (error) {
    /* ---------------- VALIDATION ---------------- */

    if (
      error instanceof Error &&
      error.name === "ZodError"
    ) {
      return c.json(
        {
          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "Invalid order item. Item name, quantity, and price greater than 0 are required.",
          },
        },
        400
      );
    }

    /* ---------------- INVALID ITEM ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_ORDER_ITEM"
    ) {
      return c.json(
        {
          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "Item name, quantity greater than 0, and price greater than 0 are required",
          },
        },
        400
      );
    }

    /* ---------------- ORDER NOT FOUND ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "RESOURCE_NOT_FOUND"
    ) {
      return c.json(
        {
          error: {
            code:
              "RESOURCE_NOT_FOUND",

            message:
              "Order not found",
          },
        },
        404
      );
    }

    throw error;
  }
}

/* =========================================================
   DELETE ITEM
========================================================= */

export async function deleteItem(
  c: Context
) {
  try {
    const orderId =
      c.req.param("id");

    const itemId =
      c.req.param("itemId");

    if (
      !orderId ||
      !itemId
    ) {
      return c.json(
        {
          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "Order ID and item ID are required",
          },
        },
        400
      );
    }

    const order =
      await orderService.deleteOrderItem(
        orderId,
        itemId
      );

    return c.json({
      data: order,
    });
  } catch (error) {
    /* ---------------- LAST ITEM ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "ORDER_MUST_HAVE_ITEMS"
    ) {
      return c.json(
        {
          error: {
            code:
              "VALIDATION_FAILED",

            message:
              "An order must contain at least one item. The last item cannot be deleted.",
          },
        },
        400
      );
    }

    /* ---------------- ORDER NOT FOUND ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "RESOURCE_NOT_FOUND"
    ) {
      return c.json(
        {
          error: {
            code:
              "RESOURCE_NOT_FOUND",

            message:
              "Order not found",
          },
        },
        404
      );
    }

    /* ---------------- ITEM NOT FOUND ---------------- */

    if (
      error instanceof Error &&
      error.message ===
        "ITEM_NOT_FOUND"
    ) {
      return c.json(
        {
          error: {
            code:
              "RESOURCE_NOT_FOUND",

            message:
              "Order item not found",
          },
        },
        404
      );
    }

    throw error;
  }
}