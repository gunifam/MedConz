import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import {
  consultations,
  shareBlocks,
  sharedLinks,
  shareRequests,
  symptomChecks,
  timelineEntries,
  user,
} from "@medconz/db";
import { hashCode, throttle } from "@/lib/share/codes";

function cutoff(range: string): Date | null {
  if (range === "6m") return new Date(Date.now() - 182 * 24 * 3600_000);
  if (range === "1y") return new Date(Date.now() - 365 * 24 * 3600_000);
  return null;
}

// POST /api/share/:id/open {code} — no login (recipient). Verifies code,
// expiry, revocation and blocks. Counts opens; first open alerts the owner.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = (await req.json().catch(() => ({}))) as { code?: string };
  const code = (body.code ?? "").trim().toUpperCase();
  const rows = await db.select().from(sharedLinks).where(eq(sharedLinks.id, params.id)).limit(1);
  const link = rows[0];
  // Neutral answers everywhere: never reveal whether a link exists.
  if (!link) return NextResponse.json({ available: false }, { status: 404 });
  if (!throttle(`open:${params.id}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many tries. Wait a little." }, { status: 429 });
  }
  const dead =
    !!link.revokedAt || new Date(link.expiresAt).getTime() < Date.now() || link.codeHash !== hashCode(code);
  if (dead) {
    return NextResponse.json(
      { available: false, message: "This link is no longer available." },
      { status: 410 },
    );
  }
  const first = link.openCount === 0;
  await db
    .update(sharedLinks)
    .set({ openCount: link.openCount + 1 })
    .where(eq(sharedLinks.id, link.id));

  const scope = (link.scope ?? {}) as { range?: string };
  const since = cutoff(scope.range ?? "6m");
  const entries = await db
    .select({
      entry: timelineEntries,
      complaint: symptomChecks.chiefComplaint,
      doctorName: user.name,
      answers: symptomChecks.answers,
    })
    .from(timelineEntries)
    .leftJoin(symptomChecks, eq(symptomChecks.id, timelineEntries.checkId))
    .leftJoin(consultations, eq(consultations.id, timelineEntries.consultationId))
    .leftJoin(user, eq(user.id, consultations.doctorId))
    .where(eq(timelineEntries.patientId, link.patientId))
    .orderBy(desc(timelineEntries.createdAt))
    .limit(100);

  return NextResponse.json({
    available: true,
    firstOpen: first,
    entries: entries
      .filter((r) => r.entry.visible && (!since || new Date(r.entry.createdAt) >= since))
      .map((r) => ({
        kind: r.entry.kind,
        date: r.entry.createdAt,
        complaint: r.complaint ?? "",
        doctor: r.doctorName,
        answers: r.answers ?? {},
      })),
  });
}
