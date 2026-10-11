import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { sharedLinks, shareRequests } from "@medconz/db";
import { hashCode, makeShareCode } from "@/lib/share/codes";

// POST /api/share/requests/:id {decision: approve|ignore, days?}
// Approve mints a FRESH link+code (never reuses). Never auto-approved.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { decision?: string; days?: number };
  const rows = await db
    .select()
    .from(shareRequests)
    .where(and(eq(shareRequests.id, params.id), eq(shareRequests.patientId, u.id)))
    .limit(1);
  const r = rows[0];
  if (!r || r.status !== "open") return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (body.decision === "ignore") {
    await db.update(shareRequests).set({ status: "ignored" }).where(eq(shareRequests.id, r.id));
    return NextResponse.json({ ignored: true });
  }
  if (body.decision !== "approve") return NextResponse.json({ error: "Use approve|ignore." }, { status: 400 });
  const days = [1, 7, 30].includes(body.days ?? 0) ? (body.days as number) : 7;
  const orig = (
    await db.select().from(sharedLinks).where(eq(sharedLinks.id, r.linkId)).limit(1)
  )[0];
  const code = makeShareCode();
  const [link] = await db
    .insert(sharedLinks)
    .values({
      patientId: u.id,
      scope: orig?.scope ?? { range: "6m" },
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + days * 24 * 3600_000),
    })
    .returning({ id: sharedLinks.id });
  await db.update(shareRequests).set({ status: "approved" }).where(eq(shareRequests.id, r.id));
  return NextResponse.json({ approved: true, linkId: link.id, code, for: r.fromName });
}
