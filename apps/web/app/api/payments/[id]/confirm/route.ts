import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { consultations, payments, symptomChecks } from "@medconz/db";
import { charge } from "@/lib/payments/providers";

// POST /api/payments/:id/confirm — completes the charge (mock in local dev),
// marks paid, and puts the patient in line (consultation row, status waiting).
// Idempotent: confirming twice never double-charges.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const u = await getUser();
  if (!u) return unauthorized();
  const rows = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.id, params.id),
        or(eq(payments.patientId, u.id), eq(payments.paidById, u.id)),
      ),
    )
    .limit(1);
  const p = rows[0];
  if (!p) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (p.status === "paid") return NextResponse.json({ paid: true, alreadyPaid: true, paymentId: p.id });
  if (p.status !== "pending") {
    return NextResponse.json({ error: `Cannot confirm a ${p.status} payment.` }, { status: 409 });
  }
  if (p.quoteExpiresAt && new Date(p.quoteExpiresAt).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Price hold ran out. Start again for a fresh price.", expired: true },
      { status: 410 },
    );
  }

  // Never charge twice for the same consultation.
  if (p.checkId) {
    const dup = await db
      .select({ id: payments.id })
      .from(payments)
      .where(and(eq(payments.checkId, p.checkId), eq(payments.status, "paid")))
      .limit(1);
    if (dup.length > 0) {
      await db.update(payments).set({ status: "failed" }).where(eq(payments.id, p.id));
      return NextResponse.json({ paid: true, alreadyPaid: true, paymentId: dup[0].id });
    }
  }

  const result = await charge({ amountNgn: p.amountNgn, quotedAmount: p.quotedAmount, currency: p.currency });
  if (!result.ok) {
    await db.update(payments).set({ status: "failed" }).where(eq(payments.id, p.id));
    return NextResponse.json({ error: result.message }, { status: 402 });
  }
  await db
    .update(payments)
    .set({ status: "paid", providerRef: result.providerRef })
    .where(eq(payments.id, p.id));

  let consultationId: string | null = null;
  if (p.checkId) {
    const existing = await db
      .select({ id: consultations.id })
      .from(consultations)
      .where(eq(consultations.checkId, p.checkId))
      .limit(1);
    if (existing.length > 0) {
      consultationId = existing[0].id;
    } else {
      // Check-in worse → rebook with doctor notified: moves forward in line.
      const chk = p.checkId
        ? (
            await db
              .select({ answers: symptomChecks.answers })
              .from(symptomChecks)
              .where(eq(symptomChecks.id, p.checkId))
              .limit(1)
          )[0]
        : null;
      const rebook = ((chk?.answers ?? {}) as Record<string, unknown>).rebook as
        | { notifyDoctor?: boolean }
        | undefined;
      const [c] = await db
        .insert(consultations)
        .values({
          checkId: p.checkId,
          patientId: p.patientId,
          doctorId: null,
          paymentId: p.id,
          feelingWorse: !!rebook?.notifyDoctor,
          status: "waiting",
        })
        .returning({ id: consultations.id });
      consultationId = c.id;
    }
  }

  return NextResponse.json({ paid: true, paymentId: p.id, consultationId, note: result.message });
}
