import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { user } from "@medconz/db";

// POST /api/checkin/preferences {off: boolean} — check-ins can be turned off.
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { off?: boolean };
  await db
    .update(user)
    .set({ checkinsOff: !!body.off, updatedAt: new Date() })
    .where(eq(user.id, u.id));
  return NextResponse.json({ off: !!body.off });
}
