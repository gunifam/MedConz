"use client";

import { useEffect, useState } from "react";

type Visit = { id: string; status: string; complaint: string; doctor: string; date: string; hasSummary: boolean };
type Due = { id: string; kind: string; label: string | null; consultationId: string | null };

export function VisitsClient() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [due, setDue] = useState<Due[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/visits").then((r) => r.json()).then((d) => setVisits(d.visits ?? [])).catch(() => {});
    fetch("/api/checkin").then((r) => r.json()).then((d) => setDue(d.due ?? [])).catch(() => {});
  }, []);

  async function answer(id: string, feeling: string, notifyDoctor = false) {
    const res = await fetch(`/api/checkin/${id}/respond`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ feeling, notifyDoctor }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      worse?: boolean;
      emergency?: { title: string; note: string };
      rebook?: { checkinId: string };
      recorded?: string;
      error?: string;
    };
    if (!res.ok) {
      setMsg(data.error ?? "Could not send.");
      return;
    }
    if (data.worse && data.rebook) {
      const rb = await fetch(`/api/checkin/${data.rebook.checkinId}/rebook`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notifyDoctor }),
      });
      const rbd = (await rb.json()) as { checkId?: string };
      setMsg(
        (data.emergency ? data.emergency.title + " " + data.emergency.note + " " : "") +
          (rbd.checkId ? `Your follow-up check is ready.` : ""),
      );
      if (rbd.checkId) {
        window.location.href = `/check/${rbd.checkId}`;
        return;
      }
    } else {
      setMsg(`Thank you — recorded: ${data.recorded}.`);
    }
    setDue((d) => d.filter((x) => x.id !== id));
  }

  async function turnOff() {
    await fetch("/api/checkin/preferences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ off: true }),
    });
    setDue([]);
    setMsg("Check-ins turned off. You can turn them on anytime from a visit.");
  }

  return (
    <main>
      <h1>Your visits</h1>
      {due.filter((x) => x.kind === "feeling").map((x) => (
        <section className="mc-card" key={x.id} aria-label="Check-in">
          <h2>How are you feeling now?</h2>
          <p className="mc-muted">One tap. You can turn these off.</p>
          <div className="mc-row">
            <button type="button" className="mc-btn" onClick={() => answer(x.id, "better")}>Better</button>
            <button type="button" className="mc-btn" onClick={() => answer(x.id, "same")}>The same</button>
            <button type="button" className="mc-btn" onClick={() => answer(x.id, "worse", true)}>Worse</button>
          </div>
          <button type="button" className="mc-btn mc-btn-quiet" onClick={turnOff}>Turn off check-ins</button>
        </section>
      ))}
      {due.filter((x) => x.kind === "reminder").map((x) => (
        <section className="mc-card" key={x.id}>
          <p>{x.label}</p>
        </section>
      ))}
      {msg ? <p aria-live="polite">{msg}</p> : null}
      {visits.length === 0 ? (
        <section className="mc-card"><p>No visits yet.</p></section>
      ) : (
        <ul className="mc-summary">
          {visits.map((v) => (
            <li key={v.id}>
              <div>
                <div><strong>{v.complaint || "(visit)"}</strong></div>
                <div className="mc-muted">{v.doctor} · {new Date(v.date).toLocaleDateString()} · {v.status}</div>
              </div>
              <a className="mc-btn mc-btn-quiet" href={`/visits/${v.id}`}>Open</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
