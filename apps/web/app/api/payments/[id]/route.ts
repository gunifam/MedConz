import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { payments } from "@medconz/db";
import { applyRefund } from "@/lib/payments/refunds";

// GET: one receipt. Only patient or payer — never doctors.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db.select().from(payments).where(eq(payments.id, params.id)).limit(1);
  const p = rows[0];
  if (!p || (p.patientId !== u.id && p.paidById !== u.id)) {
    return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
  }
  return NextResponse.json({
    payment: {
      id: p.id,
      amount: p.quotedAmount,
      currency: p.currency,
      ngnValue: String(p.amountNgn),
      date: p.createdAt,
      status: p.status,
      checkId: p.checkId,
    },
  });
}

// POST /api/payments/:id/refund {reason} — plain-words outcome.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db.select().from(payments).where(eq(payments.id, params.id)).limit(1);
  const p = rows[0];
  if (!p || (p.patientId !== u.id && p.paidById !== u.id)) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  const body = (await req.json().catch(() => ({}))) as { reason?: string };
  const r = await applyRefund(p.id, body.reason ?? "patient request");
  if (!r.ok) return NextResponse.json({ error: r.message }, { status: 409 });
  return NextResponse.json({ refunded: true, message: r.message });
}
