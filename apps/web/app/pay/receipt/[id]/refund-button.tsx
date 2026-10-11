"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefundButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    setBusy(true);
    const res = await fetch(`/api/payments/${paymentId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: "patient request from receipt" }),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string; refunded?: boolean };
    setBusy(false);
    setMsg(data.refunded ? data.message ?? "Refunded." : (data.error ?? "Could not refund."));
    if (data.refunded) router.refresh();
  }

  return (
    <div>
      <button type="button" className="mc-btn mc-btn-quiet" disabled={busy} onClick={ask}>
        Ask for a refund
      </button>
      {msg ? <p aria-live="polite">{msg}</p> : null}
    </div>
  );
}
