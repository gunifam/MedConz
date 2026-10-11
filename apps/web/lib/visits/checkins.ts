import { and, eq, lte } from "drizzle-orm";
import { db } from "../db";
import { checkins, user } from "@medconz/db";

const hours = () => {
  const n = Number(process.env.FOLLOWUP_CHECKIN_HOURS ?? 36);
  return Number.isFinite(n) && n > 0 ? n : 36;
};

/** One-tap "how are you feeling?" due hours after a DONE visit (PRD 10). */
export async function scheduleFeelingCheckin(consultationId: string, patientId: string) {
  const me = (
    await db.select({ off: user.checkinsOff }).from(user).where(eq(user.id, patientId)).limit(1)
  )[0];
  if (me?.off) return null;
  const [row] = await db
    .insert(checkins)
    .values({
      consultationId,
      patientId,
      kind: "feeling",
      dueAt: new Date(Date.now() + hours() * 3600_000),
    })
    .returning({ id: checkins.id });
  return row.id;
}

export async function dueCheckins(patientId: string) {
  const me = (
    await db.select({ off: user.checkinsOff }).from(user).where(eq(user.id, patientId)).limit(1)
  )[0];
  if (me?.off) return [];
  return db
    .select()
    .from(checkins)
    .where(
      and(
        eq(checkins.patientId, patientId),
        eq(checkins.status, "pending"),
        lte(checkins.dueAt, new Date()),
      ),
    );
}
