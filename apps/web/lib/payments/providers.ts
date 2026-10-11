// Provider abstraction. Local dev uses `mock` (instant, clearly labelled,
// no real money). Wire Paystack/Flutterwave/crypto gateways here later —
// the API shape (charge -> webhook confirm -> refund) stays the same.

export type Provider = "mock" | "paystack" | "flutterwave" | "crypto";

export function activeProvider(): Provider {
  const p = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();
  return p === "paystack" || p === "flutterwave" || p === "crypto" ? p : "mock";
}

export type ChargeResult = { ok: boolean; providerRef: string; message: string };

export async function charge(args: {
  amountNgn: number;
  quotedAmount: string;
  currency: string;
}): Promise<ChargeResult> {
  const provider = activeProvider();
  if (provider !== "mock") {
    return {
      ok: false,
      providerRef: "",
      message: `${provider} is not wired yet. Set PAYMENT_PROVIDER=mock for local testing.`,
    };
  }
  if (args.amountNgn === 0) {
    return { ok: true, providerRef: `mock-free-${Date.now()}`, message: "Free follow-up — no charge." };
  }
  // Demo checkout: always succeeds. Real gateways redirect + webhook here.
  return {
    ok: true,
    providerRef: `mock-${Date.now()}`,
    message: "Demo checkout — no real money moved.",
  };
}

export async function refundCharge(providerRef: string): Promise<ChargeResult> {
  if (!providerRef.startsWith("mock-")) {
    return { ok: false, providerRef, message: "Live-gateway refunds are handled by the finance team." };
  }
  return { ok: true, providerRef: `${providerRef}-refunded`, message: "Refunded in full to the same currency." };
}
