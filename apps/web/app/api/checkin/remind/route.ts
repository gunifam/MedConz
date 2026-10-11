import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { checkins, consultations } from "@medconz/db";

// POST /api/checkin/remind {consultationId, days: 3|7|14} — gentle opt-in
// reminders, e.g. "It is time to book your follow-up".
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { consultationId?: string; days?: number };
  if (!body.consultationId || ![3, 7, 14].includes(body.days ?? 0)) {
    return NextResponse.json({ error: "Use consultationId + days 3|7|14." }, { status: 400 });
  }
  const rows = await db
    .select({ id: consultations.id })
    .from(consultations)
    .where(and(eq(consultations.id, body.consultationId), eq(consultations.patientId, u.id)))
    .limit(1);
  if (rows.length === 0) return NextResponse.json({ error: "Visit not found." }, { status: 404 });
  const [r] = await db
    .insert(checkins)
    .values({
      consultationId: body.consultationId,
      patientId: u.id,
      kind: "reminder",
      label: "It is time to book your follow-up.",
      dueAt: new Date(Date.now() + (body.days as number) * 24 * 3600_000),
    })
    .returning({ id: checkins.id });
  return NextResponse.json({ id: r.id });
}
