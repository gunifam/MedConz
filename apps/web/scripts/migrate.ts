import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Load the single repo-root .env (three levels above apps/web/scripts).
const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "..", "..", "..", ".env") });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Missing DATABASE_URL (check repo-root .env)");
const client = postgres(url, { max: 1 });
await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
await client.end();
console.log("migrations applied");
