import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@medconz/db";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://medconz:medconz@localhost:5433/medconz";

const client = postgres(connectionString, {
  max: 10,
  // Required for pooled connections (Neon pooler / PgBouncer): named
  // prepared statements break under transaction pooling, and raw queries
  // misleadingly keep working while parameterized ones fail.
  prepare: false,
});
export const db = drizzle(client, { schema });
