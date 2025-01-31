import { Context, Next } from "hono";
import { UserRole } from "@prisma/client";

export const roleMiddleware = (roles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!roles.includes(user.role)) {
      return c.json(
        {
          success: false,
          message: "Insufficient permissions",
        },
        403
      );
    }

    await next();
  };
};
