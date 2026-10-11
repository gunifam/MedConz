import { NextResponse } from "next/server";
import { desc, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { payments } from "@medconz/db";

// GET: my payment history + receipts. Only patient or payer — never doctors.
export async function GET() {
  const u = await getUser();
  if (!u) return unauthorized();
  const all = await db
    .select({
      id: payments.id,
      amount: payments.quotedAmount,
      currency: payments.currency,
      ngnValue: payments.amountNgn,
      date: payments.createdAt,
      status: payments.status,
      checkId: payments.checkId,
    })
    .from(payments)
    .where(or(eq(payments.patientId, u.id), eq(payments.paidById, u.id)))
    .orderBy(desc(payments.createdAt))
    .limit(50);
  return NextResponse.json({ payments: all.map((p) => ({ ...p, ngnValue: String(p.ngnValue) })) });
}
