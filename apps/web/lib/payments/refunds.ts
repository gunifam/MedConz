import { eq } from "drizzle-orm";
import { db } from "../db";
import { payments } from "@medconz/db";
import { refundCharge } from "./providers";

// Shared by patient requests, missed-turn handling and Phase-7 auto-refunds.
// Only PAID payments move; everything is recorded on the row.
export async function applyRefund(
  paymentId: string,
  reason: string,
): Promise<{ ok: boolean; message: string }> {
  const rows = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  const p = rows[0];
  if (!p) return { ok: false, message: "Payment not found." };
  if (p.status === "refunded") return { ok: true, message: "Already refunded." };
  if (p.status !== "paid") return { ok: false, message: "Only paid consultations can be refunded." };
  const r = await refundCharge(p.providerRef ?? "");
  if (!r.ok) return { ok: false, message: r.message };
  await db
    .update(payments)
    .set({ status: "refunded", providerRef: r.providerRef })
    .where(eq(payments.id, paymentId));
  return { ok: true, message: `${r.message} Reason: ${reason}` };
}
