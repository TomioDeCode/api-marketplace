import { config } from "dotenv";
config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "database.sqlite",
};
