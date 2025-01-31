import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { router } from "./routes";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";

const app = new Hono();

app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors());
app.use("*", errorHandler());

app.route("/api", router);

app.get("/health", (c) => c.json({ status: "ok" }));

export default app;

import { schedule } from "node-cron";
import { prisma } from "./config/database";
import { MonitorService } from "./services/monitor_service";

const monitorService = new MonitorService();

schedule("* * * * *", async () => {
  try {
    const endpoints = await prisma.endpoint.findMany({
      where: {
        status: {
          not: "DOWN",
        },
        lastChecked: {
          lte: new Date(Date.now() - 60000),
        },
      },
    });

    for (const endpoint of endpoints) {
      try {
        await monitorService.checkEndpoint(endpoint);
      } catch (error) {
        console.error(`Error checking endpoint ${endpoint.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});
