import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/session";
import { DOCTOR_ROLES, forbidden, getUserWithRole } from "@/lib/roles";
import { consultations, symptomChecks } from "@medconz/db";
import { sortQueue, type Queued } from "@/lib/queue/ordering";
import type { Flag } from "@/lib/checks/emergency";

// GET /api/queue/list — doctor view of the line. Pre-accept minimal:
// main problem + flags + language only, never full answers (PRD 9.1).
// Filters: ?mine=1 (auto-match my specialty) &specialty= &lang=
//          &returning=new|returning &flagged=1
// If no doctor accepts in reasonable time, cases stay visible here for
// another matching doctor (escalation by re-offer; auto-timer later).
export async function GET(req: Request) {
  const u = await getUserWithRole();
  if (!u) return unauthorized();
  if (!DOCTOR_ROLES.includes(u.role)) return forbidden();

  const q = new URL(req.url).searchParams;
  const mySpec = (u.specialty ?? u.role === "dentist" ? "dentist" : "doctor") as string;
  const specialtyFilter = q.get("mine") === "1" ? mySpec : q.get("specialty");
  const langFilter = q.get("lang");
  const returningFilter = q.get("returning"); // new | returning
  const flaggedOnly = q.get("flagged") === "1";

  const donePatients = new Set(
    (
      await db
        .select({ pid: consultations.patientId })
        .from(consultations)
        .where(eq(consultations.status, "done"))
    ).map((r) => r.pid),
  );

  const all = await db.select().from(consultations);
  const queueable = all.filter((c) => ["waiting", "left", "ready"].includes(c.status ?? ""));
  const items: (Queued & {
    complaint: string;
    flags: Flag[];
    language: string;
    specialty: string | null;
    isReturning: boolean;
    status: string;
    snoozedUntil: unknown;
    createdAt: Date;
  })[] = [];
  for (const c of queueable) {
    const chk = c.checkId
      ? (
          await db
            .select()
            .from(symptomChecks)
            .where(eq(symptomChecks.id, c.checkId))
            .limit(1)
        )[0]
      : null;
    const flags = ((chk?.flags ?? []) as Flag[]);
    const spec = chk?.specialtySuggestion ?? null;
    if (specialtyFilter && specialtyFilter !== "all" && spec !== specialtyFilter) continue;
    if (langFilter && langFilter !== "all" && (chk?.language ?? "en") !== langFilter) continue;
    const isReturning = donePatients.has(c.patientId);
    if (returningFilter === "new" && isReturning) continue;
    if (returningFilter === "returning" && !isReturning) continue;
    if (flaggedOnly && !(flags.some((f) => f.urgent) || c.feelingWorse)) continue;
    items.push({
      id: c.id,
      createdAt: c.createdAt,
      urgent: c.urgent,
      feelingWorse: c.feelingWorse,
      priorityOverride: c.priorityOverride,
      hasEmergencyFlag: flags.some((f) => f.urgent),
      status: c.status ?? "",
      complaint: chk?.chiefComplaint ?? "",
      flags,
      language: chk?.language ?? "en",
      specialty: spec,
      isReturning,
      snoozedUntil: c.snoozedUntil,
    });
  }
  const ordered = sortQueue(items);
  return NextResponse.json({
    mySpecialty: mySpec,
    queue: ordered.map((x, i) => ({
      id: x.id,
      position: i,
      status: x.status,
      complaint: x.complaint,
      flags: x.flags,
      language: x.language,
      specialty: x.specialty,
      isReturning: x.isReturning,
      feelingWorse: !!x.feelingWorse,
      snoozedUntil: x.snoozedUntil,
      createdAt: x.createdAt,
    })),
  });
}
