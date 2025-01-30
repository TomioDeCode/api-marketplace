import { Context, Next } from "hono";
import { jwt, TokenPayload, honoResponse } from "../utils";
import { USER_ROLE } from "../constant";

export const authMiddleware = {
  isAuth: async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header("Authorization");
      if (!authHeader) {
        return honoResponse.unauthorized(c);
      }

      const token = jwt.extractToken(authHeader);
      if (!token) {
        return honoResponse.unauthorized(c);
      }

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || ""
      ) as TokenPayload;
      if (!payload) {
        return honoResponse.unauthorized(c);
      }

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return honoResponse.error(c, "Token has expired", 401);
      }

      c.set("user", payload);
      return next();
    } catch (error) {
      return honoResponse.error(c, "An unexpected error occurred");
    }
  },

  isAdmin: async (c: Context, next: Next) => {
    try {
      const user = c.get("user") as TokenPayload;
      if (user.role !== USER_ROLE.ADMIN) {
        return honoResponse.forbidden(c);
      }
      await next();
    } catch (error) {
      return honoResponse.error(c, "Authorization failed", 500);
    }
  },

  hasRoles: (roles: string[]) => {
    return async (c: Context, next: Next) => {
      try {
        const user = c.get("user") as TokenPayload;
        if (!roles.includes(user.role)) {
          return honoResponse.forbidden(c);
        }
        await next();
      } catch (error) {
        return honoResponse.error(c, "Authorization failed", 500);
      }
    };
  },

  isResourceOwner: (getResourceUserId: (c: Context) => Promise<string>) => {
    return async (c: Context, next: Next) => {
      try {
        const user = c.get("user") as TokenPayload;
        const resourceUserId = await getResourceUserId(c);

        if (user.role === USER_ROLE.ADMIN) {
          return next();
        }

        if (user.id !== resourceUserId) {
          return honoResponse.forbidden(c);
        }

        await next();
      } catch (error) {
        return honoResponse.error(c, "Authorization failed", 500);
      }
    };
  },

  optionalAuth: async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header("Authorization");
      if (authHeader) {
        const token = jwt.extractToken(authHeader);
        if (token) {
          try {
            const payload = jwt.verify(
              token,
              process.env.JWT_SECRET || ""
            ) as TokenPayload;
            if (
              payload &&
              (!payload.exp || payload.exp > Math.floor(Date.now() / 1000))
            ) {
              c.set("user", payload);
            }
          } catch (error) {}
        }
      }
      await next();
    } catch (error) {
      return honoResponse.error(c, "Authentication failed", 500);
    }
  },

  combine: (...middlewares: ((c: Context, next: Next) => Promise<void>)[]) => {
    return async (c: Context, next: Next) => {
      try {
        for (const middleware of middlewares) {
          await middleware(c, next);
        }
      } catch (error) {
        return honoResponse.error(c, "Authorization failed", 500);
      }
    };
  },
};
