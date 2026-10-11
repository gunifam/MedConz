import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/session";
import { DOCTOR_ROLES, forbidden, getUserWithRole } from "@/lib/roles";
import { consultations, symptomChecks } from "@medconz/db";
import type { Flag } from "@/lib/checks/emergency";

// GET /api/doctor/consultations — my claimed/active visits.
export async function GET() {
  const u = await getUserWithRole();
  if (!u) return unauthorized();
  if (!DOCTOR_ROLES.includes(u.role)) return forbidden();
  const rows = await db
    .select({
      consultation: consultations,
      complaint: symptomChecks.chiefComplaint,
      language: symptomChecks.language,
    })
    .from(consultations)
    .leftJoin(symptomChecks, eq(symptomChecks.id, consultations.checkId))
    .where(and(eq(consultations.doctorId, u.id)))
    .orderBy(desc(consultations.createdAt))
    .limit(50);
  return NextResponse.json({
    consultations: rows
      .filter((r) => ["in_consult", "ready"].includes(r.consultation.status ?? ""))
      .map((r) => ({
        id: r.consultation.id,
        status: r.consultation.status,
        complaint: r.complaint ?? "",
        language: r.language ?? "en",
        feelingWorse: !!r.consultation.feelingWorse,
        claimedAt: r.consultation.claimedAt,
      })),
  });
}
