import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/session";
import { DOCTOR_ROLES, forbidden, getUserWithRole } from "@/lib/roles";
import { logAccess } from "@/lib/access";
import { consultations, infoRequests, symptomChecks, timelineEntries, user } from "@medconz/db";
import type { Flag } from "@/lib/checks/emergency";

// GET /api/doctor/consultation/:id — full detail, only AFTER I claimed it.
// Every open is access-logged (PRD 11.2).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const u = await getUserWithRole();
  if (!u) return unauthorized();
  if (!DOCTOR_ROLES.includes(u.role)) return forbidden();

  const rows = await db
    .select()
    .from(consultations)
    .where(and(eq(consultations.id, params.id), eq(consultations.doctorId, u.id)))
    .limit(1);
  const c = rows[0];
  if (!c) return NextResponse.json({ error: "Claim it from the line first." }, { status: 403 });
  if (!c.checkId) return NextResponse.json({ error: "No check attached." }, { status: 409 });

  const chk = (
    await db.select().from(symptomChecks).where(eq(symptomChecks.id, c.checkId)).limit(1)
  )[0];
  if (!chk) return NextResponse.json({ error: "Check gone." }, { status: 404 });

  await logAccess({ actorId: u.id, patientId: c.patientId, whatOpened: "symptom check", reason: "consultation" });

  const answers = (chk.answers ?? {}) as Record<string, unknown>;
  const flags = ((chk.flags ?? []) as Flag[]);
  const caregiver = (answers.caregiver ?? {}) as Record<string, unknown>;

  // Relevant history: past submitted checks + visits (deleted stay gone).
  const history = await db
    .select({
      id: symptomChecks.id,
      complaint: symptomChecks.chiefComplaint,
      submittedAt: symptomChecks.submittedAt,
    })
    .from(symptomChecks)
    .where(and(eq(symptomChecks.patientId, c.patientId), eq(symptomChecks.status, "submitted")))
    .orderBy(desc(symptomChecks.submittedAt))
    .limit(10);

  const requests = await db
    .select()
    .from(infoRequests)
    .where(eq(infoRequests.consultationId, c.id))
    .orderBy(desc(infoRequests.createdAt))
    .limit(20);
  // Surface expiry: open requests past TTL read as expired.
  const now = Date.now();
  for (const r of requests) {
    if (r.status === "open" && new Date(r.expiresAt).getTime() < now) {
      await db.update(infoRequests).set({ status: "expired" }).where(eq(infoRequests.id, r.id));
      r.status = "expired";
    }
  }

  const patient = (
    await db.select({ name: user.name }).from(user).where(eq(user.id, c.patientId)).limit(1)
  )[0];

  return NextResponse.json({
    consultation: {
      id: c.id,
      status: c.status,
      feelingWorse: !!c.feelingWorse,
      snoozedUntil: c.snoozedUntil,
      notesDraft: c.notesDraft,
      notesFinal: c.notesFinal,
      notesPrivate: c.notesPrivate,
      nextSteps: c.nextSteps,
      warningSigns: c.warningSigns,
      inpersonFlag: !!c.inpersonFlag,
      claimedAt: c.claimedAt,
    },
    patient: { name: patient?.name ?? "Patient" },
    check: {
      complaint: chk.chiefComplaint,
      language: chk.language,
      answers,
      flags,
      accuracyFlag: !!chk.accuracyFlag,
      specialtySuggestion: chk.specialtySuggestion,
      submittedAt: chk.submittedAt,
    },
    caregiver: {
      forSelf: caregiver.forSelf !== false,
      relationship: (caregiver.relationship as string | undefined) ?? null,
      minorTick: !!caregiver.minorTick,
      adultProof: (caregiver.adultProof as string | undefined) ?? null,
    },
    openFlags: flags.map((f) => f.label), // checklist before sending (never blocking)
    history: history.filter((h) => h.id !== chk.id),
    requests: requests.map((r) => ({
      id: r.id,
      message: r.message,
      status: r.status,
      response: r.response,
      expiresAt: r.expiresAt,
    })),
  });
}
