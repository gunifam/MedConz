import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { checkins, consultations, symptomChecks } from "@medconz/db";
import { CONTENT_VERSION } from "@/lib/checks/content";

// POST /api/checkin/:id/rebook {notifyDoctor?} — quick way back to a doctor
// for the same problem: prefilled draft (complaint, basics, context).
// Payment is usually free via the follow-up window; the queue still triages.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select()
    .from(checkins)
    .where(and(eq(checkins.id, params.id), eq(checkins.patientId, u.id)))
    .limit(1);
  const row = rows[0];
  if (!row?.consultationId) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const consults = await db
    .select()
    .from(consultations)
    .where(and(eq(consultations.id, row.consultationId), eq(consultations.patientId, u.id)))
    .limit(1);
  const consult = consults[0];
  if (!consult?.checkId) return NextResponse.json({ error: "Original visit gone." }, { status: 404 });
  const orig = (
    await db.select().from(symptomChecks).where(eq(symptomChecks.id, consult.checkId)).limit(1)
  )[0];
  if (!orig) return NextResponse.json({ error: "Original check gone." }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { notifyDoctor?: boolean };
  const origAnswers = (orig.answers ?? {}) as Record<string, unknown>;
  const [draft] = await db
    .insert(symptomChecks)
    .values({
      patientId: u.id,
      filledById: u.id,
      status: "draft",
      language: orig.language ?? "en",
      chiefComplaint: `Follow-up: ${orig.chiefComplaint ?? ""}`.slice(0, 300),
      answers: {
        caregiver: (origAnswers.caregiver ?? { forSelf: true }) as Record<string, unknown>,
        context: (origAnswers.context ?? {}) as Record<string, unknown>,
        duration: origAnswers.duration ?? null,
        severity: origAnswers.severity ?? null,
        rebook: {
          consultationId: consult.id,
          priorDoctorId: consult.doctorId,
          notifyDoctor: !!body.notifyDoctor,
          sameDoctorPreferred: true,
        },
      },
      contentVersion: CONTENT_VERSION,
    })
    .returning({ id: symptomChecks.id });
  return NextResponse.json({ checkId: draft.id });
}
