"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  position: number;
  status: string;
  complaint: string;
  flags: { id: string; label: string; urgent: boolean }[];
  language: string;
  specialty: string | null;
  isReturning: boolean;
  feelingWorse: boolean;
};

export function DoctorList() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [mine, setMine] = useState(true);
  const [lang, setLang] = useState("all");
  const [ret, setRet] = useState("all");
  const [flagged, setFlagged] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (mine) p.set("mine", "1");
    if (lang !== "all") p.set("lang", lang);
    if (ret !== "all") p.set("returning", ret);
    if (flagged) p.set("flagged", "1");
    const res = await fetch(`/api/queue/list?${p.toString()}`);
    if (!res.ok) {
      setMsg("Could not load the line.");
      return;
    }
    const data = (await res.json()) as { queue: Row[] };
    setRows(data.queue);
  }, [mine, lang, ret, flagged]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  async function claim(id: string) {
    setMsg("");
    const res = await fetch(`/api/queue/${id}/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "claim" }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setMsg(data.error ?? "Could not claim.");
      return;
    }
    router.push(`/doctor/${id}`);
  }

  return (
    <main>
      <h1>Waiting patients</h1>
      <div className="mc-row" aria-label="Filters">
        <button type="button" className="mc-chip" aria-pressed={mine} onClick={() => setMine(!mine)}>
          My specialty only
        </button>
        <select className="mc-select" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
          <option value="all">All languages</option>
          <option value="en">English</option>
          <option value="ha">Hausa</option>
          <option value="yo">Yoruba</option>
          <option value="ig">Igbo</option>
        </select>
        <select className="mc-select" value={ret} onChange={(e) => setRet(e.target.value)} aria-label="New or returning">
          <option value="all">New + returning</option>
          <option value="new">New</option>
          <option value="returning">Returning</option>
        </select>
        <button type="button" className="mc-chip" aria-pressed={flagged} onClick={() => setFlagged(!flagged)}>
          Flagged first
        </button>
      </div>
      {msg ? <p aria-live="polite">{msg}</p> : null}
      {rows.length === 0 ? (
        <section className="mc-card"><p>No one waiting with these filters.</p></section>
      ) : (
        <ul className="mc-summary">
          {rows.map((r) => (
            <li key={r.id}>
              <div>
                <div><strong>{r.complaint || "(no complaint)"}</strong></div>
                <div className="mc-muted">
                  {r.language.toUpperCase()} · {r.specialty ?? "unsorted"} · {r.isReturning ? "returning" : "new"}
                  {r.feelingWorse ? " · FEELING WORSE" : ""}
                  {r.flags.map((f) => f.label).join("; ") ? ` · ⚠ ${r.flags.map((f) => f.label).join("; ")}` : ""}
                </div>
              </div>
              <button type="button" className="mc-btn mc-btn-primary" onClick={() => claim(r.id)}>
                Accept
              </button>
            </li>
          ))}
        </ul>
      )}
      <p><a className="mc-link" href="/doctor/visits">My visits</a></p>
    </main>
  );
}
