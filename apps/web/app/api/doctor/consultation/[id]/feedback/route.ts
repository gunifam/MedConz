import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/session";
import { DOCTOR_ROLES, forbidden, getUserWithRole } from "@/lib/roles";
import { consultations, doctorFeedback } from "@medconz/db";

// POST /api/doctor/consultation/:id/feedback {useful} — was the summary useful?
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUserWithRole();
  if (!u) return unauthorized();
  if (!DOCTOR_ROLES.includes(u.role)) return forbidden();
  const rows = await db
    .select({ id: consultations.id })
    .from(consultations)
    .where(and(eq(consultations.id, params.id), eq(consultations.doctorId, u.id)))
    .limit(1);
  if (rows.length === 0) return NextResponse.json({ error: "Not yours." }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as { useful?: boolean };
  await db.insert(doctorFeedback).values({
    consultationId: params.id,
    doctorId: u.id,
    useful: body.useful ?? null,
  });
  return NextResponse.json({ thanks: true });
}
