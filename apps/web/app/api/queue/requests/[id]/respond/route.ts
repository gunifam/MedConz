import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { consultations, infoRequests } from "@medconz/db";

// POST {response} — answer in a few taps. Has an "I need help" path via the
// normal consultation (patient can always message through waiting notes).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select({ r: infoRequests, cid: consultations.id, pid: consultations.patientId })
    .from(infoRequests)
    .innerJoin(consultations, eq(consultations.id, infoRequests.consultationId))
    .where(and(eq(infoRequests.id, params.id), eq(consultations.patientId, u.id)))
    .limit(1);
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (row.r.status !== "open" || new Date(row.r.expiresAt).getTime() < Date.now()) {
    await db.update(infoRequests).set({ status: "expired" }).where(eq(infoRequests.id, params.id));
    return NextResponse.json({ error: "Time ran out — the doctor was told and moved on." }, { status: 410 });
  }
  const body = (await req.json().catch(() => ({}))) as { response?: string };
  const response = (body.response ?? "").trim().slice(0, 500);
  if (!response) return NextResponse.json({ error: "Write your answer first." }, { status: 400 });
  await db
    .update(infoRequests)
    .set({ status: "answered", response })
    .where(eq(infoRequests.id, params.id));
  return NextResponse.json({ answered: true });
}
