import { Context, Next } from "hono";
import { z } from "zod";

export const validateRequest = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      await schema.parseAsync(body);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            message: "Validation failed",
            errors: error.errors,
          },
          400
        );
      }
      throw error;
    }
  };
};
