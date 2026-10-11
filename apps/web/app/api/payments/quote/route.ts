import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getUser, unauthorized } from "@/lib/session";
import { symptomChecks } from "@medconz/db";
import { CRYPTO_DECIMALS, cryptoFor, espeesFor, formatNgn, pricing, type CryptoCode } from "@/lib/payments/pricing";
import { cryptoNgnRates } from "@/lib/payments/crypto";
import { freeFollowup } from "@/lib/payments/followup";

// GET /api/payments/quote?checkId=&currency=NGN|ESPEES|CRYPTO&crypto=BTC
// Shows the exact amount in the chosen currency BEFORE the patient confirms.
export async function GET(req: Request) {
  const u = await getUser();
  if (!u) return unauthorized();
  const url = new URL(req.url);
  const checkId = url.searchParams.get("checkId") ?? "";
  const currency = (url.searchParams.get("currency") ?? "NGN").toUpperCase();
  const crypto = (url.searchParams.get("crypto") ?? "BTC").toUpperCase() as CryptoCode;

  const checks = await db
    .select({ id: symptomChecks.id, status: symptomChecks.status })
    .from(symptomChecks)
    .where(and(eq(symptomChecks.id, checkId), eq(symptomChecks.patientId, u.id)))
    .limit(1);
  if (checks.length === 0) return NextResponse.json({ error: "Check not found." }, { status: 404 });
  if (checks[0].status !== "submitted") {
    return NextResponse.json({ error: "Finish the symptom check first." }, { status: 409 });
  }

  const follow = await freeFollowup(u.id);
  const priceNgn = follow.free ? 0 : pricing.consultNgn();
  const rate = pricing.espeesRate();
  const coins = pricing.cryptos();
  const feed = await cryptoNgnRates(coins);

  const cryptoAmounts: Record<string, string> = {};
  if (feed.live) {
    for (const c of coins) {
      const r = feed.rates[c];
      if (r) cryptoAmounts[c] = cryptoFor(priceNgn, r, CRYPTO_DECIMALS[c]);
    }
  }

  const selected =
    currency === "ESPEES"
      ? { currency: "ESPEES", amount: espeesFor(priceNgn, rate), note: `1 Espees = ${formatNgn(rate)} NGN` }
      : currency === "CRYPTO" && feed.rates[crypto]
        ? {
            currency: "CRYPTO",
            coin: crypto,
            amount: cryptoAmounts[crypto],
            note: `Live price — held for ${pricing.cryptoTtlMinutes()} min once you start paying.`,
          }
        : { currency: "NGN", amount: String(priceNgn), note: "No hidden charges." };

  return NextResponse.json({
    priceNgn,
    priceNgnFormatted: formatNgn(priceNgn),
    espeesRate: rate,
    amounts: { NGN: String(priceNgn), ESPEES: espeesFor(priceNgn, rate), crypto: feed.live ? cryptoAmounts : null },
    cryptoLive: feed.live,
    cryptoAsOf: feed.asOf,
    selected,
    freeFollowup: follow.free,
    freeReason: follow.reason,
  });
}
