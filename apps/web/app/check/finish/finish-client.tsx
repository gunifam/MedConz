"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearGuest, loadGuest } from "@/lib/checks/drafts";

// After sign in/up with ?next=/check/finish: moves the phone-saved guest
// check to the server, then continues to payment like any other check.
export function FinishClient() {
  const router = useRouter();
  const [msg, setMsg] = useState("Moving your answers to your account…");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const g = loadGuest();
      if (!g?.complaint) {
        router.replace("/check");
        return;
      }
      try {
        const created = await fetch("/api/checks", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ complaint: g.complaint, language: g.language, caregiver: g.caregiver }),
        });
        const c = (await created.json()) as { id?: string; error?: string };
        if (!created.ok || !c.id) throw new Error(c.error ?? "Could not save.");
        const patched = await fetch(`/api/checks/${c.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers: g.answers }),
        });
        if (!patched.ok) throw new Error("Could not save answers.");
        const sub = await fetch(`/api/checks/${c.id}/submit`, { method: "POST" });
        const s = (await sub.json()) as { error?: string };
        if (!sub.ok) throw new Error(s.error ?? "Check needs a little more first.");
        clearGuest();
        router.replace(`/check/done/${c.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not finish. Your answers stay saved on this phone.");
        setMsg("");
      }
    })();
  }, [router]);

  return (
    <main>
      <h1>One moment</h1>
      {msg ? <p aria-live="polite">{msg}</p> : null}
      {error ? (
        <>
          <p role="alert">{error}</p>
          <p><a className="mc-btn" href="/check">Back to checks</a></p>
        </>
      ) : null}
    </main>
  );
}
