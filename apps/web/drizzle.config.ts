import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../db/src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgresql://medconz:medconz@localhost:5433/medconz" },
});
