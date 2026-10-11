import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { user } from "@medconz/db";

// GET: current consent status. POST {action:"accept"|"withdraw"}.
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db.select().from(user).where(eq(user.id, u.id)).limit(1);
  return NextResponse.json({
    accepted: !!rows[0]?.consentAcceptedAt,
    acceptedAt: rows[0]?.consentAcceptedAt ?? null,
  });
}

export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  if (body.action === "accept") {
    await db
      .update(user)
      .set({ consentAcceptedAt: new Date(), updatedAt: new Date() })
      .where(eq(user.id, u.id));
    return NextResponse.json({ accepted: true });
  }
  if (body.action === "withdraw") {
    await db
      .update(user)
      .set({ consentAcceptedAt: null, updatedAt: new Date() })
      .where(eq(user.id, u.id));
    return NextResponse.json({ accepted: false });
  }
  return NextResponse.json({ error: "Use action accept|withdraw" }, { status: 400 });
}
