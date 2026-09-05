import { Context, Next } from "hono";

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.name === "ZodError"
    ) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
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
  }
}
