import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { config } from "../config";

export const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ success: false, message: "No token provided" }, 401);
  }

  try {
    const payload = await verify(token, config.jwtSecret);
    c.set("user", payload);
    await next();
  } catch (error) {
    return c.json({ success: false, message: "Invalid token" }, 401);
  }
};
