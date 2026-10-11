import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@medconz/db";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://medconz:medconz@localhost:5433/medconz";

const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });
