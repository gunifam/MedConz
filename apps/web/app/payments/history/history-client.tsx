"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  amount: string;
  currency: string;
  ngnValue: string;
  date: string;
  status: string;
  checkId: string | null;
};

export function PaymentHistory({ refundsOnly }: { refundsOnly: boolean }) {
  const [rows, setRows] = useState<Payment[]>([]);
  const [showRefunds, setShowRefunds] = useState(refundsOnly);

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => setRows((d.payments ?? []) as Payment[]))
      .catch(() => {});
  }, []);

  const list = showRefunds ? rows.filter((p) => p.status === "refunded") : rows;

  return (
    <main>
      <h1>{showRefunds ? "Refund history" : "Payment history"}</h1>
      <div className="mc-row" role="group" aria-label="Filter">
        <button type="button" className="mc-chip" aria-pressed={!showRefunds} onClick={() => setShowRefunds(false)}>
          All payments
        </button>
        <button type="button" className="mc-chip" aria-pressed={showRefunds} onClick={() => setShowRefunds(true)}>
          Refunds only
        </button>
      </div>
      {list.length === 0 ? (
        <section className="mc-card">
          <p>{showRefunds ? "No refunds yet." : "No payments yet."}</p>
        </section>
      ) : (
        <ul className="mc-summary">
          {list.map((p) => (
            <li key={p.id}>
              <div>
                <div>
                  <strong>{p.amount} {p.currency}</strong> <span className="mc-muted">({p.ngnValue} NGN)</span>
                </div>
                <div className="mc-muted">{new Date(p.date).toLocaleDateString()} · {p.status}</div>
              </div>
              <a className="mc-btn mc-btn-quiet" href={`/pay/receipt/${p.id}`}>Receipt</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
