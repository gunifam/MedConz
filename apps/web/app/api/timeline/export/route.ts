import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { consultations, symptomChecks, timelineEntries, user } from "@medconz/db";

// GET /api/timeline/export — download/print a copy (privacy reminder in UI).
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select({
      entry: timelineEntries,
      complaint: symptomChecks.chiefComplaint,
      answers: symptomChecks.answers,
      doctorName: user.name,
    })
    .from(timelineEntries)
    .leftJoin(symptomChecks, eq(symptomChecks.id, timelineEntries.checkId))
    .leftJoin(consultations, eq(consultations.id, timelineEntries.consultationId))
    .leftJoin(user, eq(user.id, consultations.doctorId))
    .where(eq(timelineEntries.patientId, u.id))
    .orderBy(desc(timelineEntries.createdAt))
    .limit(200);
  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    reminder: "This is your private health record. Store and share it carefully.",
    entries: rows
      .filter((r) => r.entry.visible)
      .map((r) => ({
        kind: r.entry.kind,
        date: r.entry.createdAt,
        complaint: r.complaint ?? "",
        doctor: r.doctorName,
        answers: r.answers ?? {},
      })),
  });
}
