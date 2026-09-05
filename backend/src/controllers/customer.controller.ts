import { Context } from "hono";
import {
  createCustomerSchema,
  customerQuerySchema,
  updateCustomerSchema,
} from "../schemas/customer.schema";
import * as customerService from "../services/customer.service";

export async function listCustomers(c: Context) {
  const query = customerQuerySchema.parse({
    search: c.req.query("search"),
    page: c.req.query("page"),
    size: c.req.query("size"),
  });

  const result = await customerService.getCustomers(
    query.search,
    query.page,
    query.size
  );

  return c.json({
    data: result.data,
    meta: {
      pagination: result.pagination,
    },
  });
}

export async function createCustomer(c: Context) {
  const body = await c.req.json();

  const data = createCustomerSchema.parse(body);

  try {
    const customer = await customerService.createCustomer(data);

    return c.json(
      {
        data: customer,
      },
      201
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "RESOURCE_ALREADY_EXISTS"
    ) {
      return c.json(
        {
          error: {
            code: "RESOURCE_ALREADY_EXISTS",
            message: "A customer with this phone already exists",
          },
        },
        409
      );
    }

    throw error;
  }
}

export async function updateCustomer(c: Context) {
  const id = c.req.param("id");

  if (!id) {
    return c.json(
      {
        error: {
          code: "RESOURCE_NOT_FOUND",
          message: "Customer ID is required",
        },
      },
      404
    );
  }

  const body = await c.req.json();

  const data = updateCustomerSchema.parse(body);

  try {
    const customer = await customerService.updateCustomer(id, data);

    return c.json({
      data: customer,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "RESOURCE_NOT_FOUND") {
        return c.json(
          {
            error: {
              code: "RESOURCE_NOT_FOUND",
              message: "Customer not found",
            },
          },
          404
        );
      }

      if (error.message === "RESOURCE_ALREADY_EXISTS") {
        return c.json(
          {
            error: {
              code: "RESOURCE_ALREADY_EXISTS",
              message: "A customer with this phone already exists",
            },
          },
          409
        );
      }
    }

    throw error;
  }
}

export async function deleteCustomer(c: Context) {
  const id = c.req.param("id");

  if (!id) {
    return c.json(
      {
        error: {
          code: "RESOURCE_NOT_FOUND",
          message: "Customer ID is required",
        },
      },
      404
    );
  }

  try {
    await customerService.deleteCustomer(id);

    return c.body(null, 204);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "RESOURCE_NOT_FOUND"
    ) {
      return c.json(
        {
          error: {
            code: "RESOURCE_NOT_FOUND",
            message: "Customer not found",
          },
        },
        404
      );
    }

    throw error;
  }
}
