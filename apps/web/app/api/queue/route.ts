import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { consultations, symptomChecks } from "@medconz/db";
import { KIND_NOTE, etaText, sortQueue, readyReminderSeconds, type Queued } from "@/lib/queue/ordering";
import type { Flag } from "@/lib/checks/emergency";

const QUEUEABLE = ["waiting", "left", "ready"];

// GET /api/queue — my place in line, ETA, and callback state.
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();

  const mine = await db
    .select()
    .from(consultations)
    .where(eq(consultations.patientId, u.id))
    .orderBy(consultations.createdAt);
  const active = [...mine].reverse().find((c) => QUEUEABLE.includes(c.status ?? ""));
  if (!active) return NextResponse.json({ active: null });

  const all = await db.select().from(consultations);
  const flagsOf = async (checkId: string | null): Promise<Flag[]> => {
    if (!checkId) return [];
    const c = await db
      .select({ flags: symptomChecks.flags })
      .from(symptomChecks)
      .where(eq(symptomChecks.id, checkId))
      .limit(1);
    return (c[0]?.flags ?? []) as Flag[];
  };
  const withFlags: Queued[] = [];
  for (const c of all.filter((x) => QUEUEABLE.includes(x.status ?? ""))) {
    withFlags.push({
      id: c.id,
      createdAt: c.createdAt,
      urgent: c.urgent,
      feelingWorse: c.feelingWorse,
      priorityOverride: c.priorityOverride,
      hasEmergencyFlag: (await flagsOf(c.checkId)).some((f) => f.urgent),
      status: c.status ?? "",
    });
  }
  const ordered = sortQueue(withFlags);
  const position = ordered.findIndex((q) => q.id === active.id);

  const check = active.checkId
    ? (
        await db
          .select()
          .from(symptomChecks)
          .where(eq(symptomChecks.id, active.checkId))
          .limit(1)
      )[0]
    : null;
  const myFlags = ((check?.flags ?? []) as Flag[]);
  const answers = (check?.answers ?? {}) as Record<string, unknown>;
  const secondsSinceReady = active.readyAt
    ? Math.floor((Date.now() - new Date(active.readyAt).getTime()) / 1000)
    : null;

  return NextResponse.json({
    active: {
      id: active.id,
      status: active.status,
      position: position < 0 ? 0 : position,
      eta: etaText(position),
      kindNote: KIND_NOTE,
      flags: myFlags,
      feelingWorse: !!active.feelingWorse,
      ready: active.status === "ready",
      secondsSinceReady,
      needsSecondReminder:
        active.status === "ready" && (secondsSinceReady ?? 0) > readyReminderSeconds(),
      snoozedUntil: active.snoozedUntil,
      waitingNotes: ((answers.waitingNotes ?? []) as unknown[]).length,
      missedCount: active.missedCount,
    },
  });
}
