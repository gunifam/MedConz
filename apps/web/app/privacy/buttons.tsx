"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConsentButtons({ accepted }: { accepted: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "accept" | "withdraw") {
    setBusy(true);
    await fetch("/api/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mc-row">
      {accepted ? (
        <button type="button" className="mc-btn" disabled={busy} onClick={() => act("withdraw")}>
          Withdraw my consent
        </button>
      ) : (
        <button type="button" className="mc-btn mc-btn-primary" disabled={busy} onClick={() => act("accept")}>
          I agree
        </button>
      )}
    </div>
  );
}
