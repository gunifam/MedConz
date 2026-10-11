import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/session";
import { DOCTOR_ROLES, forbidden, getUserWithRole } from "@/lib/roles";
import { consultations, symptomChecks } from "@medconz/db";

// POST — mark the check "seems inaccurate". Patient sees the flag and can
// explain (PRD 9.2). Repeated cases go to team review (ops, later).
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const u = await getUserWithRole();
  if (!u) return unauthorized();
  if (!DOCTOR_ROLES.includes(u.role)) return forbidden();
  const rows = await db
    .select()
    .from(consultations)
    .where(and(eq(consultations.id, params.id), eq(consultations.doctorId, u.id)))
    .limit(1);
  const c = rows[0];
  if (!c?.checkId) return NextResponse.json({ error: "Not yours." }, { status: 403 });
  await db
    .update(symptomChecks)
    .set({ accuracyFlag: true })
    .where(eq(symptomChecks.id, c.checkId));
  return NextResponse.json({ flagged: true, note: "The patient can see this flag and add an explanation." });
}
