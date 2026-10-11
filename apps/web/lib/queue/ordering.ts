// Queue ordering (PRD 8). Tiers always dominate: a possible emergency is
// never overtaken by a feeling-worse bump, and feeling-worse never jumps an
// emergency. Within a tier: FIFO, with a capped boost so long waiters are
// never pushed back again and again. Doctor override wins outright.

export type Queued = {
  id: string;
  createdAt: Date | string;
  urgent: boolean | null;
  feelingWorse: boolean | null;
  priorityOverride: number | null;
  hasEmergencyFlag: boolean;
  status: string;
};

const num = (v: string | undefined, fb: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
};
export const avgConsultMinutes = () => num(process.env.AVG_CONSULT_MINUTES, 8);
export const longWaitMinutes = () => num(process.env.LONG_WAIT_MINUTES, 30);
export const readyReminderSeconds = () => num(process.env.READY_REMINDER_SECONDS, 90);
export const snoozeMinutes = () => num(process.env.SNOOZE_MINUTES, 2);

/** 0 emergency · 1 feeling worse · 2 everyone else (FIFO + boost inside tier). */
export function tierOf(q: Queued): number {
  if (q.hasEmergencyFlag || q.urgent) return 0;
  if (q.feelingWorse) return 1;
  return 2;
}

function boostedAt(q: Queued, now: number): number {
  const created = new Date(q.createdAt).getTime();
  const waitedMin = (now - created) / 60000;
  // Long waiters move to the front of their own tier (capped 30 min credit).
  if (tierOf(q) === 2 && waitedMin > longWaitMinutes()) {
    return created - Math.min(30, waitedMin - longWaitMinutes()) * 60000;
  }
  return created;
}

export function sortQueue<T extends Queued>(rows: T[], now = Date.now()): T[] {
  return [...rows].sort((a, b) => {
    const ao = a.priorityOverride ?? 0;
    const bo = b.priorityOverride ?? 0;
    if (ao !== bo) return bo - ao;
    const t = tierOf(a) - tierOf(b);
    if (t !== 0) return t;
    return boostedAt(a, now) - boostedAt(b, now);
  });
}

/** Kind, neutral ETA. Never leaks clinical detail. */
export function etaText(position: number): string {
  if (position <= 0) return "You are next";
  const mins = Math.max(2, Math.round(position * avgConsultMinutes()));
  return `About ${mins} minutes`;
}

export const KIND_NOTE = "We are seeing some patients first based on their answers.";
