import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { consultations, symptomChecks, user } from "@medconz/db";

// GET /api/visits — my visits (done first), with summary status.
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select({
      consultation: consultations,
      complaint: symptomChecks.chiefComplaint,
      doctorName: user.name,
    })
    .from(consultations)
    .leftJoin(symptomChecks, eq(symptomChecks.id, consultations.checkId))
    .leftJoin(user, eq(user.id, consultations.doctorId))
    .where(eq(consultations.patientId, u.id))
    .orderBy(desc(consultations.createdAt))
    .limit(50);
  return NextResponse.json({
    visits: rows.map((r) => ({
      id: r.consultation.id,
      status: r.consultation.status,
      complaint: r.complaint ?? "",
      doctor: r.doctorName ?? "Doctor",
      date: r.consultation.createdAt,
      hasSummary: !!r.consultation.notesFinal,
    })),
  });
}
