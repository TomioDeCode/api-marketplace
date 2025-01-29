import { Hono } from "hono";
import { router } from "./routes";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 3600,
  })
);

app.get("/", (c) => {
  return c.json({
    message: "Welcome to the API",
    version: "1.0.0",
    status: "healthy",
  });
});

app.route("/", router);

app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`);
  return c.json(
    {
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
    500
  );
});

app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: "Route not found",
      path: c.req.path,
    },
    404
  );
});

export default app;
