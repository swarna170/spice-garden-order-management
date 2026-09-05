import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { ZodError } from "zod";
import { db } from "./db";

import { corsMiddleware } from "./middleware/cors";
import customerRoutes from "./routes/customer.routes";
import orderRoutes from "./routes/order.routes";

const app = new Hono();

app.use("*", corsMiddleware);

app.onError((error, c) => {
  console.error(error);

  if (error instanceof ZodError || error.name === "ZodError") {
    return c.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "Invalid request data",
        },
      },
      400
    );
  }

  return c.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      },
    },
    500
  );
});

app.get("/", (c) => {
  return c.json({
    message: "Spice Garden Order Management API",
  });
});

app.get("/health", async (c) => {
  try {
    await db.execute(sql`SELECT 1`);

    return c.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        status: "error",
        database: "disconnected",
      },
      500
    );
  }
});

app.route("/customers", customerRoutes);
app.route("/orders", orderRoutes);

export default app;
