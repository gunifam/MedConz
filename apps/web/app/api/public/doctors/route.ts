import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@medconz/db";

// GET — public count of doctors & dentists. No login, no identities,
// just the number for the homepage.
export async function GET() {
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(or(eq(user.role, "doctor"), eq(user.role, "dentist")));
  return NextResponse.json({ doctors: rows.length });
}
