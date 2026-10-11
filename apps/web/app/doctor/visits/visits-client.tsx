"use client";

import { useEffect, useState } from "react";

type V = { id: string; status: string; complaint: string; language: string; feelingWorse: boolean };

export function VisitsClient() {
  const [rows, setRows] = useState<V[]>([]);
  useEffect(() => {
    fetch("/api/doctor/consultations")
      .then((r) => r.json())
      .then((d) => setRows((d.consultations ?? []) as V[]))
      .catch(() => {});
  }, []);
  if (rows.length === 0) return <p className="mc-muted">No active visits. Claim one from the line.</p>;
  return (
    <ul className="mc-summary">
      {rows.map((r) => (
        <li key={r.id}>
          <span>{r.complaint} <span className="mc-muted">({r.status})</span></span>
          <a className="mc-btn mc-btn-quiet" href={`/doctor/${r.id}`}>Open</a>
        </li>
      ))}
    </ul>
  );
}
