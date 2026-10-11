import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { consultations } from "@medconz/db";
import { pricing } from "./pricing";

// Short follow-up for the same problem soon after a DONE visit needs no new
// full payment (PRD 7.2). Rule: any done consultation within the window.
export async function freeFollowup(patientId: string): Promise<{ free: boolean; reason: string }> {
  const windowH = pricing.followupFreeHours();
  const rows = await db
    .select({ createdAt: consultations.createdAt })
    .from(consultations)
    .where(and(eq(consultations.patientId, patientId), eq(consultations.status, "done")))
    .orderBy(desc(consultations.createdAt))
    .limit(1);
  if (rows.length === 0) return { free: false, reason: "" };
  const ageH = (Date.now() - new Date(rows[0].createdAt).getTime()) / 3600_000;
  if (ageH <= windowH) {
    return {
      free: true,
      reason: `Follow-up within ${windowH}h of your last visit — no new payment.`,
    };
  }
  return { free: false, reason: "" };
}
