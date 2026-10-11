import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { payments, symptomChecks } from "@medconz/db";
import { CRYPTO_DECIMALS, cryptoFor, espeesFor, pricing, type CryptoCode } from "@/lib/payments/pricing";
import { cryptoNgnRates } from "@/lib/payments/crypto";
import { freeFollowup } from "@/lib/payments/followup";

// POST /api/payments/start {checkId, currency, crypto?}
// Locks the amount. Crypto price is held for the shown TTL.
export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as {
    checkId?: string;
    currency?: string;
    crypto?: string;
  };
  const currency = (body.currency ?? "NGN").toUpperCase();
  if (!body.checkId) return NextResponse.json({ error: "checkId required." }, { status: 400 });
  if (!["NGN", "ESPEES", "CRYPTO"].includes(currency)) {
    return NextResponse.json({ error: "Use NGN|ESPEES|CRYPTO." }, { status: 400 });
  }

  const checks = await db
    .select()
    .from(symptomChecks)
    .where(and(eq(symptomChecks.id, body.checkId), eq(symptomChecks.patientId, u.id)))
    .limit(1);
  if (checks.length === 0) return NextResponse.json({ error: "Check not found." }, { status: 404 });
  if (checks[0].status !== "submitted") {
    return NextResponse.json({ error: "Finish the symptom check first." }, { status: 409 });
  }

  const existing = await db
    .select({ id: payments.id, status: payments.status })
    .from(payments)
    .where(and(eq(payments.checkId, body.checkId), eq(payments.status, "paid")))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ paymentId: existing[0].id, alreadyPaid: true });
  }

  const follow = await freeFollowup(u.id);
  const priceNgn = follow.free ? 0 : pricing.consultNgn();
  let quotedAmount: string;
  let quoteExpiresAt: Date | null = null;
  let provider = "internal";
  let coin: CryptoCode | null = null;

  if (currency === "ESPEES") {
    quotedAmount = espeesFor(priceNgn, pricing.espeesRate());
    provider = "internal-espees";
  } else if (currency === "CRYPTO") {
    const want = ((body.crypto ?? "BTC").toUpperCase()) as CryptoCode;
    if (!(pricing.cryptos() as string[]).includes(want)) {
      return NextResponse.json({ error: "Unsupported coin." }, { status: 400 });
    }
    coin = want;
    const feed = await cryptoNgnRates([coin]);
    const rate = feed.rates[coin];
    if (!rate) return NextResponse.json({ error: "Crypto price unavailable right now. Try NGN or Espees." }, { status: 503 });
    quotedAmount = cryptoFor(priceNgn, rate, CRYPTO_DECIMALS[coin]);
    quoteExpiresAt = new Date(Date.now() + pricing.cryptoTtlMinutes() * 60_000);
    provider = "crypto";
  } else {
    quotedAmount = String(priceNgn);
    provider = "paystack";
  }

  const [row] = await db
    .insert(payments)
    .values({
      patientId: u.id,
      paidById: u.id, // caregiver paying uses their own login
      checkId: body.checkId,
      amountNgn: priceNgn,
      currency: currency as "NGN" | "ESPEES" | "CRYPTO",
      quotedAmount,
      quoteExpiresAt,
      espeesRate: pricing.espeesRate(),
      provider: priceNgn === 0 ? "internal-free" : provider,
      status: "pending",
    })
    .returning({ id: payments.id });

  return NextResponse.json({
    paymentId: row.id,
    currency,
    coin,
    quotedAmount,
    amountNgn: priceNgn,
    quoteExpiresAt,
    quoteTtlMinutes: pricing.cryptoTtlMinutes(),
    freeFollowup: follow.free,
    freeReason: follow.reason,
  });
}
