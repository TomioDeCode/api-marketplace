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

      try {
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
        await next();
      } catch (jwtError) {
        if (jwtError instanceof Error) {
          if (jwtError.message.includes("expired")) {
            return honoResponse.error(c, "Token has expired", 401);
          }
          if (jwtError.message.includes("invalid")) {
            return honoResponse.error(c, "Invalid token", 401);
          }
        }
        return honoResponse.unauthorized(c);
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
      return honoResponse.error(c, "Authentication failed", 500);
    }
  },

  isAdmin: async (c: Context, next: Next) => {
    try {
      const user = c.get("user") as TokenPayload;
      if (!user) {
        return honoResponse.unauthorized(c);
      }

      if (user.role !== USER_ROLE.ADMIN) {
        return honoResponse.forbidden(c);
      }

      await next();
    } catch (error) {
      console.error("Admin check error:", error);
      return honoResponse.error(c, "Authorization failed", 500);
    }
  },

  hasRoles: (roles: string[]) => {
    return async (c: Context, next: Next) => {
      try {
        const user = c.get("user") as TokenPayload;
        if (!user) {
          return honoResponse.unauthorized(c);
        }

        if (!roles.includes(user.role)) {
          return honoResponse.forbidden(c);
        }

        await next();
      } catch (error) {
        console.error("Role check error:", error);
        return honoResponse.error(c, "Authorization failed", 500);
      }
    };
  },

  isResourceOwner: (getResourceUserId: (c: Context) => Promise<string>) => {
    return async (c: Context, next: Next) => {
      try {
        const user = c.get("user") as TokenPayload;
        if (!user) {
          return honoResponse.unauthorized(c);
        }

        if (user.role === USER_ROLE.ADMIN) {
          return await next();
        }

        try {
          const resourceUserId = await getResourceUserId(c);
          if (!resourceUserId || user.id !== resourceUserId) {
            return honoResponse.forbidden(c);
          }
        } catch (resourceError) {
          console.error("Resource ID fetch error:", resourceError);
          return honoResponse.error(
            c,
            "Failed to verify resource ownership",
            500
          );
        }

        await next();
      } catch (error) {
        console.error("Resource owner check error:", error);
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
          } catch (jwtError) {
            console.debug("Optional auth token error:", jwtError);
          }
        }
      }

      await next();
    } catch (error) {
      console.error("Optional auth error:", error);
      return honoResponse.error(c, "Authentication failed", 500);
    }
  },

  combine: (...middlewares: ((c: Context, next: Next) => Promise<any>)[]) => {
    return async (c: Context, next: Next) => {
      try {
        let currentIndex = 0;

        const runMiddleware = async (): Promise<void> => {
          if (currentIndex === middlewares.length) {
            return await next();
          }

          const currentMiddleware = middlewares[currentIndex];
          currentIndex++;

          return await currentMiddleware(c, runMiddleware);
        };

        await runMiddleware();
      } catch (error) {
        console.error("Combined middleware error:", error);
        return honoResponse.error(c, "Authorization failed", 500);
      }
    };
  },
};
