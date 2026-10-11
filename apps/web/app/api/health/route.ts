import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

function r2Status(): { configured: boolean; missing: string[] } {
  const missing = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_ENDPOINT",
  ].filter((k) => {
    const v = process.env[k];
    return !v || v.includes("<") || v.includes(">");
  });
  return { configured: missing.length === 0, missing };
}

export async function GET() {
  let database: { ok: boolean; error?: string };
  try {
    await db.execute(sql`SELECT 1`);
    database = { ok: true };
  } catch (e) {
    database = { ok: false, error: (e as Error).message.slice(0, 200) };
  }

  const r2 = r2Status();
  const ok = database.ok;
  return NextResponse.json(
    {
      ok,
      app: "medconz",
      database,
      auth: {
        // Secret must be a real value, never the placeholder.
        configured:
          !!process.env.BETTER_AUTH_SECRET &&
          process.env.BETTER_AUTH_SECRET !==
            "change-me-to-32-chars-minimum-local-dev-only" &&
          process.env.BETTER_AUTH_SECRET.length >= 32,
      },
      storage: { provider: "r2", ...r2 },
    },
    { status: ok ? 200 : 503 },
  );
}
