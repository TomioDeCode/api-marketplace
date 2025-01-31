import { Hono } from "hono";
import { AuthService } from "../services/auth_service";
import { validateRequest } from "../middleware/validateRequest";
import { registerSchema, loginSchema } from "../schemas/auth_schema";

const auth = new Hono();
const authService = new AuthService();

auth.post("/register", validateRequest(registerSchema), async (c) => {
  const data = await c.req.json();
  const user = await authService.register(data);
  return c.json({ success: true, data: user });
});

auth.post("/login", validateRequest(loginSchema), async (c) => {
  const data = await c.req.json();
  const result = await authService.login(data);
  return c.json({ success: true, data: result });
});

export { auth };
