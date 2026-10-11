import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { symptomChecks, timelineEntries } from "@medconz/db";
import { evaluateEmergency } from "@/lib/checks/emergency";
import { suggestSpecialty } from "@/lib/checks/specialty";

// POST /api/checks/:id/submit — validates required basics, re-runs the
// emergency engine server-side (never trust the client), stores flags +
// specialty suggestion, and writes the timeline entry.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select()
    .from(symptomChecks)
    .where(and(eq(symptomChecks.id, params.id), eq(symptomChecks.patientId, u.id)))
    .limit(1);
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status === "submitted") {
    return NextResponse.json({
      submitted: true,
      flags: row.flags,
      specialty: row.specialtySuggestion,
    });
  }

  const answers = (row.answers ?? {}) as Record<string, unknown>;
  const complaint = (row.chiefComplaint ?? "").trim();
  const duration = answers.duration as { value?: string; unit?: string } | undefined;
  const severity = answers.severity as number | undefined;
  if (!complaint) return NextResponse.json({ error: "What is wrong is required." }, { status: 400 });
  if (!duration?.value || !duration?.unit) {
    return NextResponse.json({ error: "How long is required." }, { status: 400 });
  }
  if (typeof severity !== "number" || severity < 0 || severity > 10) {
    return NextResponse.json({ error: "How bad is required." }, { status: 400 });
  }

  const flags = evaluateEmergency({ text: complaint, answers });
  const specialty = suggestSpecialty(complaint);

  await db
    .update(symptomChecks)
    .set({
      status: "submitted",
      flags,
      specialtySuggestion: specialty.code,
      answers: { ...answers, submitted: true, specialty },
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(symptomChecks.id, params.id));

  await db.insert(timelineEntries).values({
    patientId: u.id,
    checkId: params.id,
    kind: "check",
  });

  return NextResponse.json({ submitted: true, flags, specialty });
}
