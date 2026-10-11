"use client";

import { useCallback, useEffect, useState } from "react";
import { EmergencyBanner, InfoBanner, QueueStatus } from "@medconz/ui";
import { HEALTH_TIPS, PREP_QUESTIONS } from "@/lib/queue/tips";

type Active = {
  id: string;
  status: string;
  position: number;
  eta: string;
  kindNote: string;
  flags: { id: string; label: string; urgent: boolean }[];
  feelingWorse: boolean;
  ready: boolean;
  secondsSinceReady: number | null;
  needsSecondReminder: boolean;
  snoozedUntil: string | null;
  waitingNotes: number;
  missedCount: number;
};

export function QueueClient() {
  const [active, setActive] = useState<Active | null | undefined>(undefined);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/queue");
    if (!res.ok) {
      setActive(null);
      return;
    }
    const data = (await res.json()) as { active: Active | null };
    setActive(data.active);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  async function act(action: string, extra?: Record<string, unknown>) {
    if (!active) return;
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/queue/${active.id}/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...(extra ?? {}) }),
    });
    const data = (await res.json().catch(() => ({}))) as { note?: string; error?: string; tagged?: string };
    setBusy(false);
    setMsg(data.note ?? data.tagged ?? data.error ?? "");
    if (action === "note") setNote("");
    await load();
  }

  if (active === undefined) return <main><p>Loading your place in line…</p></main>;
  if (active === null) {
    return (
      <main>
        <h1>The line</h1>
        <section className="mc-card"><p>You are not in line. Finish a check, pay, and you will appear here.</p></section>
      </main>
    );
  }

  return (
    <main>
      <h1>The line</h1>

      {active.flags.some((f) => f.urgent) ? (
        <EmergencyBanner>
          <div>Flagged: {active.flags.map((f) => f.label).join("; ")}.</div>
          <div>Emergency help is always free: call 112.</div>
        </EmergencyBanner>
      ) : null}

      {active.ready ? (
        <>
          <QueueStatus etaText="" safe onJoin={() => setMsg("Joining the consultation (video comes in Phase 8).")} />
          {active.needsSecondReminder ? (
            <InfoBanner>Your doctor is still waiting. Tap Join now when ready.</InfoBanner>
          ) : null}
          <button type="button" className="mc-btn mc-btn-quiet" disabled={busy} onClick={() => act("snooze")}>
            Give me a minute
          </button>
          {active.snoozedUntil ? (
            <p className="mc-muted">The doctor knows you are coming.</p>
          ) : null}
        </>
      ) : (
        <section className="mc-card" aria-live="polite">
          <h2>{active.eta}</h2>
          <p className="mc-muted">{active.kindNote}</p>
          <p>Place in line: {active.position + 1}{active.status === "left" ? " (you stepped out — place kept)" : ""}</p>
          <div className="mc-row">
            {active.status === "waiting" ? (
              <button type="button" className="mc-btn mc-btn-quiet" disabled={busy} onClick={() => act("leave")}>
                Step out (keep my place)
              </button>
            ) : null}
            {active.status === "left" ? (
              <button type="button" className="mc-btn mc-btn-primary" disabled={busy} onClick={() => act("rejoin")}>
                I am back — rejoin
              </button>
            ) : null}
            {!active.feelingWorse ? (
              <button type="button" className="mc-btn" disabled={busy} onClick={() => act("worse")}>
                I feel worse
              </button>
            ) : (
              <span className="mc-muted">The doctor knows you feel worse.</span>
            )}
          </div>
        </section>
      )}

      {msg ? <p aria-live="polite">{msg}</p> : null}

      <section className="mc-card">
        <h2>Add to your answers</h2>
        <p className="mc-muted">Anything new goes to the doctor marked “added while waiting”. {active.waitingNotes} note(s) so far.</p>
        <textarea
          className="mc-input"
          rows={2}
          style={{ width: "100%" }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. the fever started an hour ago"
        />
        <br />
        <button type="button" className="mc-btn" disabled={busy || !note.trim()} onClick={() => act("note", { text: note.trim() })}>
          Send to doctor
        </button>
      </section>

      <section className="mc-card">
        <h2>While you wait</h2>
        <ul>
          {HEALTH_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <h2>Questions to prepare</h2>
        <ul>
          {PREP_QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
