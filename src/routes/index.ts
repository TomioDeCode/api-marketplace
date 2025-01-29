import { Hono } from "hono";
import { authRouter } from "./auth_routes";

const router = new Hono().basePath("/api/v1");

router.route("/auth", authRouter);

export { router };
