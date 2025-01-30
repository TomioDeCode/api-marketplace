import { Hono } from "hono";
import { authRouter } from "./auth_routes";
import { userRouter } from "./user_routes";

const router = new Hono().basePath("/api/v1");

router.route("/auth", authRouter);
router.route("/users", userRouter);

export { router };
