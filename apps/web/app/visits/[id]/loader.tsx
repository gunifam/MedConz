"use client";

import { useEffect, useState } from "react";
import { VisitDetail } from "./visit-detail";

export function Loader({ id }: { id: string }) {
  const [visit, setVisit] = useState<Parameters<typeof VisitDetail>[0]["visit"] | null>(null);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    fetch(`/api/visits/${id}`)
      .then((r) => {
        if (!r.ok) {
          setGone(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setVisit(d.visit);
      })
      .catch(() => setGone(true));
  }, [id]);
  if (gone) return <main><p>This visit is not available.</p></main>;
  if (!visit) return <main><p>Opening your visit…</p></main>;
  return <VisitDetail visit={visit} />;
}
