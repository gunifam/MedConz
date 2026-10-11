import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { symptomChecks } from "@medconz/db";

// POST {explanation} — patient answers a "seems inaccurate" flag (PRD 9.2).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select()
    .from(symptomChecks)
    .where(and(eq(symptomChecks.id, params.id), eq(symptomChecks.patientId, u.id)))
    .limit(1);
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!row.accuracyFlag) return NextResponse.json({ error: "No flag on this check." }, { status: 409 });
  const body = (await req.json().catch(() => ({}))) as { explanation?: string };
  const explanation = (body.explanation ?? "").trim().slice(0, 1000);
  if (!explanation) return NextResponse.json({ error: "Write your explanation first." }, { status: 400 });
  const answers = (row.answers ?? {}) as Record<string, unknown>;
  await db
    .update(symptomChecks)
    .set({ answers: { ...answers, accuracyExplanation: explanation }, updatedAt: new Date() })
    .where(eq(symptomChecks.id, params.id));
  return NextResponse.json({ saved: true, note: "The MedConz team can review repeated cases." });
}
