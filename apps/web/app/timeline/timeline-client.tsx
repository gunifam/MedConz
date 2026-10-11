"use client";

import { useEffect, useState } from "react";
import { TimelineNode } from "@medconz/ui";

type Entry = {
  id: string;
  kind: string;
  date: string;
  complaint: string;
  doctor: string | null;
  checkId: string | null;
  consultationId: string | null;
};

export function TimelineClient() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/timeline");
    if (!res.ok) return;
    const data = (await res.json()) as { entries: Entry[] };
    setEntries(data.entries);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    const res = await fetch(`/api/timeline/${id}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { note?: string; error?: string };
    setMsg(data.note ?? data.error ?? "");
    await load();
  }

  async function download() {
    if (!window.confirm("This is your private health record. Store and share it carefully. Download anyway?")) {
      return;
    }
    const res = await fetch("/api/timeline/export");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "medconz-record.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <main>
      <h1>Your health timeline</h1>
      <div className="mc-row">
        <a className="mc-btn" href="/check">Start a new check</a>
        <button type="button" className="mc-btn mc-btn-quiet" onClick={download}>Download a copy</button>
        <a className="mc-btn mc-btn-quiet" href="/share">Share</a>
      </div>
      {msg ? <p aria-live="polite">{msg}</p> : null}
      {entries.length === 0 ? (
        <section className="mc-card"><p>Nothing here yet. Your checks and visits will appear.</p></section>
      ) : (
        <div className="mc-timeline">
          {entries.map((e) => (
            <TimelineNode
              key={e.id}
              kind={e.kind === "consultation" ? "consultation" : "check"}
              title={e.complaint || (e.kind === "consultation" ? "Visit" : "Check")}
              date={`${new Date(e.date).toLocaleDateString()}${e.doctor ? ` · Seen by ${e.doctor}` : ""}`}
              onOpen={() => {
                window.location.href = e.consultationId
                  ? `/visits/${e.consultationId}`
                  : e.checkId
                    ? `/check/done/${e.checkId}`
                    : "/timeline";
              }}
              onDelete={() => remove(e.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
