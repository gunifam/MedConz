"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InfoBanner } from "@medconz/ui";

type Quote = {
  priceNgn: number;
  priceNgnFormatted: string;
  espeesRate: number;
  amounts: { NGN: string; ESPEES: string; crypto: Record<string, string> | null };
  cryptoLive: boolean;
  cryptoAsOf: string;
  selected: { currency: string; coin?: string; amount: string; note: string };
  freeFollowup: boolean;
  freeReason: string;
};

export function PayScreen({ checkId }: { checkId: string }) {
  const router = useRouter();
  const [currency, setCurrency] = useState("NGN");
  const [coin, setCoin] = useState("BTC");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [hold, setHold] = useState<{ paymentId: string; expiresAt: string | null } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch(
      `/api/payments/quote?checkId=${checkId}&currency=${currency}&crypto=${coin}`,
    );
    const data = (await res.json().catch(() => ({}))) as Quote & { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not load prices.");
      return;
    }
    setQuote(data);
  }, [checkId, currency, coin]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (currency !== "CRYPTO") return;
    const t = setInterval(load, 30_000); // live crypto refresh while on screen
    return () => clearInterval(t);
  }, [currency, load]);
  useEffect(() => {
    if (!hold?.expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hold]);

  async function start() {
    setError("");
    setBusy(true);
    const res = await fetch("/api/payments/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ checkId, currency, crypto: coin }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      paymentId?: string;
      alreadyPaid?: boolean;
      quoteExpiresAt?: string | null;
      error?: string;
    };
    setBusy(false);
    if (!res.ok || !data.paymentId) {
      setError(data.error ?? "Could not start payment.");
      return;
    }
    if (data.alreadyPaid) {
      router.push(`/pay/receipt/${data.paymentId}`);
      return;
    }
    setHold({ paymentId: data.paymentId, expiresAt: data.quoteExpiresAt ?? null });
  }

  async function confirm() {
    if (!hold) return;
    setError("");
    setBusy(true);
    const res = await fetch(`/api/payments/${hold.paymentId}/confirm`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string; expired?: boolean };
    setBusy(false);
    if (!res.ok) {
      if (data.expired) setHold(null); // hold ran out — start again for a fresh price
      setError(data.error ?? "Payment failed.");
      return;
    }
    router.push(`/pay/receipt/${hold.paymentId}`);
  }

  const left = hold?.expiresAt ? Math.max(0, new Date(hold.expiresAt).getTime() - now) : null;

  return (
    <main>
      <h1>Pay for your consultation</h1>
      <p className="mc-muted">The price is shown before you pay. No hidden charges.</p>
      {quote?.freeFollowup ? <InfoBanner>{quote.freeReason}</InfoBanner> : null}

      <div className="mc-row" role="group" aria-label="Choose currency">
        {(["NGN", "ESPEES", "CRYPTO"] as const).map((c) => (
          <button
            key={c}
            type="button"
            className="mc-chip"
            aria-pressed={currency === c}
            onClick={() => {
              setCurrency(c);
              setHold(null);
            }}
          >
            {c === "NGN" ? "Naira" : c === "ESPEES" ? "Espees" : "Crypto"}
          </button>
        ))}
      </div>

      {quote ? (
        <section className="mc-card" aria-live="polite">
          <ul className="mc-summary">
            <li><span className="mc-muted">Naira</span><strong>{quote.amounts.NGN} NGN</strong></li>
            <li><span className="mc-muted">Espees</span><span>{quote.amounts.ESPEES} Espees</span></li>
            <li>
              <span className="mc-muted">Crypto</span>
              <span>
                {quote.amounts.crypto
                  ? Object.entries(quote.amounts.crypto).map(([k, v]) => `${v} ${k}`).join(" · ")
                  : "Unavailable right now — try Naira or Espees."}
              </span>
            </li>
          </ul>
          <p>
            You pay: <strong>{quote.selected.amount} {quote.selected.coin ?? quote.selected.currency}</strong>
          </p>
          <p className="mc-muted">{quote.selected.note}</p>
          {currency === "CRYPTO" && quote.cryptoLive ? (
            <p className="mc-muted">Price updated just now and refreshes while you are here.</p>
          ) : null}
          {currency === "CRYPTO" ? (
            <label className="mc-row">
              <span className="mc-muted">Coin</span>
              <select className="mc-select" value={coin} onChange={(e) => { setCoin(e.target.value); setHold(null); }}>
                {["BTC", "ETH", "USDT"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          ) : null}
        </section>
      ) : null}

      {error ? <p role="alert">{error}</p> : null}

      {!hold ? (
        <button type="button" className="mc-btn mc-btn-primary" disabled={busy || !quote} onClick={start}>
          Start paying
        </button>
      ) : (
        <section className="mc-card">
          <p>
            Price held{left !== null ? ` — ${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, "0")} left` : ""}.
          </p>
          <p className="mc-muted">Demo checkout — no real money moves in local testing.</p>
          <button type="button" className="mc-btn mc-btn-primary" disabled={busy} onClick={confirm}>
            Pay now
          </button>
        </section>
      )}
    </main>
  );
}
