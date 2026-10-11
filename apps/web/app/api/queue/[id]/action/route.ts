import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { DOCTOR_ROLES, forbidden, getUserWithRole } from "@/lib/roles";
import { logAccess } from "@/lib/access";
import { scheduleFeelingCheckin } from "@/lib/visits/checkins";
import { consultations, symptomChecks, timelineEntries, user } from "@medconz/db";
import { snoozeMinutes } from "@/lib/queue/ordering";

// POST /api/queue/:id/action {action, ...}
// Patient (own): worse | note | leave | rejoin | snooze
// Doctor: claim | ready | snooze | missed | nudge | front | handoff | complete
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    text?: string;
    dir?: string;
    toDoctorId?: string;
  };
  const action = body.action ?? "";

  const rows = await db
    .select()
    .from(consultations)
    .where(eq(consultations.id, params.id))
    .limit(1);
  const c = rows[0];
  if (!c) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const mine = c.patientId === u.id;

  const patientActions = ["worse", "note", "leave", "rejoin", "snooze"];
  const doctorOnly = ["claim", "ready", "missed", "nudge", "front", "handoff", "complete"];
  const doctorActions = [...doctorOnly, "snooze"];
  if (patientActions.includes(action) && !mine) {
    return NextResponse.json({ error: "Not yours." }, { status: 403 });
  }
  let doctorId: string | null = null;
  if (doctorActions.includes(action) && !mine) {
    const du = await getUserWithRole();
    if (!du || !DOCTOR_ROLES.includes(du.role)) return forbidden();
    doctorId = du.id;
  } else if (doctorOnly.includes(action) && mine) {
    return NextResponse.json({ error: "Doctors only." }, { status: 403 });
  }

  switch (action) {
    case "worse": {
      if (!["waiting", "left"].includes(c.status ?? "")) {
        return NextResponse.json({ error: "Not in line." }, { status: 409 });
      }
      await db
        .update(consultations)
        .set({ feelingWorse: true, status: "waiting" })
        .where(eq(consultations.id, c.id));
      return NextResponse.json({ ok: true, note: "You moved forward. Emergencies still go first." });
    }
    case "note": {
      const text = (body.text ?? "").trim().slice(0, 500);
      if (!text) return NextResponse.json({ error: "Write something first." }, { status: 400 });
      if (!c.checkId) return NextResponse.json({ error: "No check attached." }, { status: 409 });
      const chk = (
        await db.select().from(symptomChecks).where(eq(symptomChecks.id, c.checkId)).limit(1)
      )[0];
      const answers = (chk?.answers ?? {}) as Record<string, unknown>;
      const notes = (answers.waitingNotes ?? []) as { text: string; at: string }[];
      notes.push({ text, at: new Date().toISOString() });
      await db
        .update(symptomChecks)
        .set({ answers: { ...answers, waitingNotes: notes }, updatedAt: new Date() })
        .where(eq(symptomChecks.id, c.checkId));
      return NextResponse.json({ ok: true, tagged: "added while waiting" });
    }
    case "leave": {
      if (c.status !== "waiting") return NextResponse.json({ error: "Not waiting." }, { status: 409 });
      await db.update(consultations).set({ status: "left" }).where(eq(consultations.id, c.id));
      return NextResponse.json({ ok: true, note: "Your place is kept. We will call you back." });
    }
    case "rejoin": {
      if (!["left", "missed"].includes(c.status ?? "")) {
        return NextResponse.json({ error: "Nothing to rejoin." }, { status: 409 });
      }
      await db
        .update(consultations)
        .set({ status: "waiting", readyAt: null, snoozedUntil: null })
        .where(eq(consultations.id, c.id));
      return NextResponse.json({ ok: true, note: "You are back in line with your answers and payment." });
    }
    case "ready": {
      await db
        .update(consultations)
        .set({ status: "ready", readyAt: new Date(), doctorId: doctorId ?? c.doctorId })
        .where(eq(consultations.id, c.id));
      // Lock-screen-safe: title only, zero health details.
      return NextResponse.json({ ok: true, notify: { title: "Your doctor is ready", body: "Open MedConz to join." } });
    }
    case "snooze": {
      const until = new Date(Date.now() + snoozeMinutes() * 60_000);
      await db.update(consultations).set({ snoozedUntil: until }).where(eq(consultations.id, c.id));
      return NextResponse.json({ ok: true, snoozedUntil: until, note: "The doctor knows you are coming." });
    }
    case "missed": {
      await db
        .update(consultations)
        .set({ status: "missed", readyAt: null, missedCount: (c.missedCount ?? 0) + 1 })
        .where(eq(consultations.id, c.id));
      // Answers + payment untouched: rejoin, book later, or try again.
      return NextResponse.json({ ok: true, note: "Your answers and payment are kept." });
    }
    case "nudge": {
      const delta = body.dir === "down" ? -10 : 10;
      await db
        .update(consultations)
        .set({ priorityOverride: (c.priorityOverride ?? 0) + delta })
        .where(eq(consultations.id, c.id));
      return NextResponse.json({ ok: true });
    }
    case "front": {
      // Doctor handoff: patient moves to the front, keeps everything.
      await db
        .update(consultations)
        .set({ priorityOverride: 100, status: "waiting", readyAt: null })
        .where(eq(consultations.id, c.id));
      return NextResponse.json({ ok: true, note: "Moved to the front of the queue." });
    }
    case "claim": {
      // Accept from the line. Full answers appear only after this point.
      if (!["waiting", "left", "ready"].includes(c.status ?? "")) {
        return NextResponse.json({ error: "Not in line." }, { status: 409 });
      }
      if (c.doctorId && c.doctorId !== doctorId) {
        return NextResponse.json({ error: "Another doctor already claimed this." }, { status: 409 });
      }
      await db
        .update(consultations)
        .set({ doctorId, status: "in_consult", claimedAt: new Date() })
        .where(eq(consultations.id, c.id));
      await logAccess({ actorId: doctorId, patientId: c.patientId, whatOpened: "queue case", reason: "claim" });
      return NextResponse.json({ ok: true, consultationId: c.id });
    }
    case "handoff": {
      // Doctor cannot continue: notes carry over, patient goes to the front.
      // Only what was actually said or recorded travels with them.
      if (c.doctorId !== doctorId) {
        return NextResponse.json({ error: "Only the claiming doctor hands off." }, { status: 403 });
      }
      const toDoctorId = (body.toDoctorId ?? "").trim();
      if (toDoctorId) {
        const exists = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.id, toDoctorId))
          .limit(1);
        if (exists.length === 0) {
          return NextResponse.json({ error: "That doctor does not exist." }, { status: 400 });
        }
      }
      await db
        .update(consultations)
        .set({
          doctorId: toDoctorId || null,
          status: "waiting",
          readyAt: null,
          snoozedUntil: null,
          claimedAt: null,
          priorityOverride: 100,
        })
        .where(eq(consultations.id, c.id));
      return NextResponse.json({ ok: true, note: "Patient moves to the front with notes kept." });
    }
    case "complete": {
      if (c.doctorId !== doctorId) {
        return NextResponse.json({ error: "Only the claiming doctor completes." }, { status: 403 });
      }
      if (!["in_consult", "ready"].includes(c.status ?? "")) {
        return NextResponse.json({ error: "Nothing to complete." }, { status: 409 });
      }
      await db.update(consultations).set({ status: "done" }).where(eq(consultations.id, c.id));
      await db.insert(timelineEntries).values({
        patientId: c.patientId,
        checkId: c.checkId,
        consultationId: c.id,
        kind: "consultation",
      });
      await scheduleFeelingCheckin(c.id, c.patientId);
      return NextResponse.json({ ok: true, note: "Visit saved to the timeline." });
    }
    default:
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
}
