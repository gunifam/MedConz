import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { consultations, symptomChecks, timelineEntries, user } from "@medconz/db";

// GET /api/timeline — my visible entries (deleted stay gone), newest first.
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select({
      entry: timelineEntries,
      complaint: symptomChecks.chiefComplaint,
      doctorName: user.name,
    })
    .from(timelineEntries)
    .leftJoin(symptomChecks, eq(symptomChecks.id, timelineEntries.checkId))
    .leftJoin(consultations, eq(consultations.id, timelineEntries.consultationId))
    .leftJoin(user, eq(user.id, consultations.doctorId))
    .where(eq(timelineEntries.patientId, u.id))
    .orderBy(desc(timelineEntries.createdAt))
    .limit(100);
  return NextResponse.json({
    entries: rows
      .filter((r) => r.entry.visible)
      .map((r) => ({
        id: r.entry.id,
        kind: r.entry.kind,
        date: r.entry.createdAt,
        complaint: r.complaint ?? "",
        doctor: r.doctorName,
        checkId: r.entry.checkId,
        consultationId: r.entry.consultationId,
      })),
  });
}
