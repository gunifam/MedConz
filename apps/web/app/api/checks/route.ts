import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { symptomChecks } from "@medconz/db";
import { CONTENT_VERSION } from "@/lib/checks/content";

// GET: my drafts for resume (newest first).
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select({
      id: symptomChecks.id,
      chiefComplaint: symptomChecks.chiefComplaint,
      language: symptomChecks.language,
      updatedAt: symptomChecks.updatedAt,
    })
    .from(symptomChecks)
    .where(and(eq(symptomChecks.patientId, u.id), eq(symptomChecks.status, "draft")))
    .orderBy(desc(symptomChecks.updatedAt))
    .limit(5);
  return NextResponse.json({ drafts: rows });
}

// POST: start a check. Body: {complaint, language, caregiver?}.
// Prefills context (conditions/allergies/meds) from the last submitted check.
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as {
    complaint?: string;
    language?: string;
    caregiver?: Record<string, unknown>;
  };
  const complaint = (body.complaint ?? "").trim();
  if (!complaint) return NextResponse.json({ error: "Tell us what is wrong first." }, { status: 400 });

  const prev = await db
    .select({ answers: symptomChecks.answers })
    .from(symptomChecks)
    .where(eq(symptomChecks.patientId, u.id))
    .orderBy(desc(symptomChecks.updatedAt))
    .limit(10);
  const lastSubmitted = prev.find(
    (p) => (p.answers as Record<string, unknown>)?.submitted === true,
  )?.answers as Record<string, unknown> | undefined;
  const ctx = (lastSubmitted?.context ?? {}) as Record<string, unknown>;

  const [row] = await db
    .insert(symptomChecks)
    .values({
      patientId: u.id,
      filledById: u.id,
      status: "draft",
      language: body.language ?? "en",
      chiefComplaint: complaint,
      answers: { caregiver: body.caregiver ?? { forSelf: true }, context: ctx, prefilled: Object.keys(ctx).length > 0 },
      contentVersion: CONTENT_VERSION,
    })
    .returning({ id: symptomChecks.id });
  return NextResponse.json({ id: row.id, prefilled: Object.keys(ctx).length > 0 });
}
