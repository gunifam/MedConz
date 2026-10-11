import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/session";
import { DOCTOR_ROLES, forbidden, getUserWithRole } from "@/lib/roles";
import { consultations } from "@medconz/db";

async function mine(consultId: string, doctorId: string) {
  const rows = await db
    .select()
    .from(consultations)
    .where(and(eq(consultations.id, consultId), eq(consultations.doctorId, doctorId)))
    .limit(1);
  return rows[0] ?? null;
}

// POST {draft?, final?, private?} — doctor reviews/edits before patient sees.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUserWithRole();
  if (!u) return unauthorized();
  if (!DOCTOR_ROLES.includes(u.role)) return forbidden();
  const c = await mine(params.id, u.id);
  if (!c) return NextResponse.json({ error: "Not yours." }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as {
    draft?: string;
    final?: string;
    private?: string;
    nextSteps?: string;
    warningSigns?: string;
    inpersonFlag?: boolean;
  };
  await db
    .update(consultations)
    .set({
      notesDraft: body.draft ?? c.notesDraft,
      notesFinal: body.final ?? c.notesFinal,
      notesPrivate: body.private ?? c.notesPrivate,
      nextSteps: body.nextSteps ?? c.nextSteps,
      warningSigns: body.warningSigns ?? c.warningSigns,
      inpersonFlag: body.inpersonFlag ?? c.inpersonFlag,
    })
    .where(eq(consultations.id, c.id));
  return NextResponse.json({ saved: true, note: "Only the final summary reaches the patient (Phase 9). Private notes never do." });
}

// GET — drafted summary starter built from the check (edit required).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const u = await getUserWithRole();
  if (!u) return unauthorized();
  if (!DOCTOR_ROLES.includes(u.role)) return forbidden();
  const c = await mine(params.id, u.id);
  if (!c) return NextResponse.json({ error: "Not yours." }, { status: 403 });
  return NextResponse.json({ draft: c.notesDraft ?? "", final: c.notesFinal ?? "" });
}
