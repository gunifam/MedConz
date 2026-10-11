import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { consultations, feedback, symptomChecks, user } from "@medconz/db";

// GET /api/visits/:id — my visit in plain words. Private doctor notes are
// never selected here, so they can never leak.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select({
      consultation: consultations,
      complaint: symptomChecks.chiefComplaint,
      language: symptomChecks.language,
      doctorName: user.name,
    })
    .from(consultations)
    .leftJoin(symptomChecks, eq(symptomChecks.id, consultations.checkId))
    .leftJoin(user, eq(user.id, consultations.doctorId))
    .where(and(eq(consultations.id, params.id), eq(consultations.patientId, u.id)))
    .limit(1);
  const r = rows[0];
  if (!r) return NextResponse.json({ error: "Visit not found." }, { status: 404 });
  const c = r.consultation;
  return NextResponse.json({
    visit: {
      id: c.id,
      status: c.status,
      complaint: r.complaint ?? "",
      language: r.language ?? "en",
      doctor: r.doctorName ?? "Doctor",
      date: c.createdAt,
      summary: c.notesFinal,
      nextSteps: c.nextSteps,
      warningSigns: c.warningSigns,
      inpersonFlag: !!c.inpersonFlag,
    },
  });
}

// POST /api/visits/:id/feedback {rating?, comment?, wrong?} — optional,
// never blocks. wrong=true jumps the review queue.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select({ id: consultations.id })
    .from(consultations)
    .where(and(eq(consultations.id, params.id), eq(consultations.patientId, u.id)))
    .limit(1);
  if (rows.length === 0) return NextResponse.json({ error: "Visit not found." }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as {
    rating?: number;
    comment?: string;
    wrong?: boolean;
  };
  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5 ? body.rating : null;
  const comment = (body.comment ?? "").trim().slice(0, 1000) || null;
  if (rating === null && !comment && !body.wrong) {
    return NextResponse.json({ error: "Nothing to send." }, { status: 400 });
  }
  await db.insert(feedback).values({
    consultationId: params.id,
    patientId: u.id,
    rating,
    comment,
    wrongFlag: !!body.wrong,
  });
  return NextResponse.json({ thanks: true });
}
