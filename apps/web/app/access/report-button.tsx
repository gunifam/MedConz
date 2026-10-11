"use client";

import { useState } from "react";

export function ReportButton({ logId }: { logId: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  async function report() {
    setState("busy");
    const res = await fetch("/api/access-log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ logId }),
    });
    setState(res.ok ? "done" : "idle");
  }

  if (state === "done") return <span className="mc-muted">Reported — we will tell you what we find.</span>;
  return (
    <button type="button" className="mc-btn mc-btn-quiet" disabled={state === "busy"} onClick={report}>
      Report this
    </button>
  );
}
