import { Hono } from "hono";
import { authController } from "../controllers/auth_controller";

const authRouter = new Hono();

authRouter.post("/register", async (c) => {
  return await authController.register(c);
});

authRouter.post("/login", async (c) => {
  return await authController.login(c);
});

authRouter.get("/verify-email", async (c) => {
  return await authController.verifyEmail(c);
});

authRouter.post("/resend-verification-email", async (c) => {
  return await authController.resendVerificationEmail(c);
});

export { authRouter };
