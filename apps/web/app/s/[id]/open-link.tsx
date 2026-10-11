"use client";

import { useState } from "react";

type Entry = { kind: string; date: string; complaint: string; doctor: string | null; answers: Record<string, unknown> };

export function OpenLink({ id }: { id: string }) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<"ask" | "dead" | "open">("ask");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [msg, setMsg] = useState("");
  const [name, setName] = useState("");

  async function open() {
    const res = await fetch(`/api/share/${id}/open`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const d = (await res.json().catch(() => ({}))) as {
      available?: boolean;
      message?: string;
      entries?: Entry[];
      error?: string;
    };
    if (!res.ok || !d.available) {
      setState("dead");
      setMsg(d.message ?? d.error ?? "This link is no longer available.");
      return;
    }
    setEntries(d.entries ?? []);
    setState("open");
  }

  async function request() {
    if (!name.trim()) {
      setMsg("Tell us your name first.");
      return;
    }
    await fetch(`/api/share/${id}/request`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setMsg("Request sent. The patient decides — nothing is approved automatically.");
  }

  if (state === "open") {
    return (
      <main>
        <h1>Shared record</h1>
        {entries.length === 0 ? <p>No entries in this range.</p> : (
          <ul className="mc-summary">
            {entries.map((e, i) => (
              <li key={i}>
                <div>
                  <div><strong>{e.complaint || e.kind}</strong></div>
                  <div className="mc-muted">{new Date(e.date).toLocaleDateString()}{e.doctor ? ` · ${e.doctor}` : ""}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    );
  }

  return (
    <main>
      <h1>Shared record</h1>
      {state === "ask" ? (
        <section className="mc-card">
          <label>Enter the code the patient gave you<br />
            <input className="mc-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. K7Q2MD" />
          </label>
          <br /><br />
          <button type="button" className="mc-btn mc-btn-primary" onClick={open}>Open</button>
        </section>
      ) : (
        <section className="mc-card">
          <p>{msg || "This link is no longer available."}</p>
          <label>Your name<br />
            <input className="mc-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Who should the patient see?" />
          </label>
          <br /><br />
          <button type="button" className="mc-btn" onClick={request}>Request access</button>
        </section>
      )}
      {state === "dead" && msg ? <p aria-live="polite">{msg}</p> : null}
    </main>
  );
}
