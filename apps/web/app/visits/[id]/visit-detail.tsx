"use client";

import { useState } from "react";
import { EmergencyBanner } from "@medconz/ui";

export function VisitDetail({ visit }: { visit: {
  id: string;
  status: string;
  complaint: string;
  language: string;
  doctor: string;
  date: string;
  summary: string | null;
  nextSteps: string | null;
  warningSigns: string | null;
  inpersonFlag: boolean;
} }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [wrong, setWrong] = useState(false);
  const [msg, setMsg] = useState("");
  const [remindMsg, setRemindMsg] = useState("");

  async function sendFeedback() {
    const res = await fetch(`/api/visits/${visit.id}/feedback`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rating: rating || undefined, comment: comment || undefined, wrong }),
    });
    const data = (await res.json().catch(() => ({}))) as { thanks?: boolean; error?: string };
    setMsg(data.thanks ? "Thank you — your feedback helps us improve." : (data.error ?? "Could not send."));
  }

  async function remind(days: number) {
    const res = await fetch("/api/checkin/remind", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ consultationId: visit.id, days }),
    });
    setRemindMsg(res.ok ? `We will remind you in ${days} days.` : "Could not set the reminder.");
  }

  return (
    <main>
      <h1>Your visit</h1>
      <p className="mc-muted">{visit.doctor} · {new Date(visit.date).toLocaleDateString()} · shown in {visit.language.toUpperCase()}</p>

      {visit.warningSigns ? (
        <EmergencyBanner title="Go to a hospital if you notice:">
          <div>{visit.warningSigns}</div>
        </EmergencyBanner>
      ) : null}

      <section className="mc-card">
        <h2>Summary in plain words</h2>
        <p>{visit.summary ?? "The doctor has not written the summary yet."}</p>
      </section>

      {visit.nextSteps ? (
        <section className="mc-card">
          <h2>Next steps</h2>
          <p>{visit.nextSteps}</p>
          <div className="mc-row">
            {[3, 7, 14].map((d) => (
              <button key={d} type="button" className="mc-btn mc-btn-quiet" onClick={() => remind(d)}>
                Remind me in {d} days
              </button>
            ))}
          </div>
          {remindMsg ? <p aria-live="polite">{remindMsg}</p> : null}
        </section>
      ) : null}

      {visit.inpersonFlag ? (
        <section className="mc-card">
          <h2>In-person visit needed</h2>
          <p>The doctor says this needs to be seen in person. Book an in-person visit soon.</p>
        </section>
      ) : null}

      <section className="mc-card">
        <h2>How was your visit? (optional)</h2>
        <div className="mc-row" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className="mc-chip" aria-pressed={rating === n} onClick={() => setRating(n)}>
              {n}
            </button>
          ))}
        </div>
        <br />
        <textarea className="mc-input" rows={2} style={{ width: "100%" }} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Short comment (optional)" />
        <br />
        <label className="mc-check">
          <input type="checkbox" checked={wrong} onChange={(e) => setWrong(e.target.checked)} />
          <span>Something in my summary was wrong</span>
        </label>
        <br />
        <button type="button" className="mc-btn" onClick={sendFeedback}>Send feedback</button>
        {msg ? <p aria-live="polite">{msg}</p> : null}
      </section>
    </main>
  );
}
