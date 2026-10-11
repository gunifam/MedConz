import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { symptomChecks } from "@medconz/db";

async function own(id: string, uid: string) {
  const rows = await db
    .select()
    .from(symptomChecks)
    .where(and(eq(symptomChecks.id, id), eq(symptomChecks.patientId, uid)))
    .limit(1);
  return rows[0] ?? null;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const row = await own(params.id, u.id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ check: row });
}

// PATCH: autosave. Body may carry {complaint?, answers?, language?}. Drafts only.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const row = await own(params.id, u.id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "draft") return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  const body = (await req.json().catch(() => ({}))) as {
    complaint?: string;
    answers?: Record<string, unknown>;
    language?: string;
  };
  const prev = (row.answers ?? {}) as Record<string, unknown>;
  await db
    .update(symptomChecks)
    .set({
      chiefComplaint: body.complaint?.trim() || row.chiefComplaint,
      answers: { ...prev, ...(body.answers ?? {}) },
      language: body.language ?? row.language,
      updatedAt: new Date(),
    })
    .where(eq(symptomChecks.id, params.id));
  return NextResponse.json({ saved: true });
}
