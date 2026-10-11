"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Detail = {
  consultation: {
    id: string;
    status: string;
    feelingWorse: boolean;
    snoozedUntil: string | null;
    notesDraft: string | null;
    notesFinal: string | null;
    notesPrivate: string | null;
    nextSteps?: string | null;
    warningSigns?: string | null;
    inpersonFlag?: boolean;
  };
  patient: { name: string };
  check: {
    complaint: string;
    language: string;
    answers: Record<string, unknown>;
    flags: { id: string; label: string; urgent: boolean }[];
    accuracyFlag: boolean;
    specialtySuggestion: string | null;
  };
  caregiver: { forSelf: boolean; relationship: string | null; minorTick: boolean; adultProof: string | null };
  openFlags: string[];
  history: { id: string; complaint: string; submittedAt: string }[];
  requests: { id: string; message: string; status: string; response: string | null }[];
};

export function DetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [d, setD] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [draft, setDraft] = useState("");
  const [final, setFinal] = useState("");
  const [priv, setPriv] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [warningSigns, setWarningSigns] = useState("");
  const [inperson, setInperson] = useState(false);
  const [reqMsg, setReqMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/doctor/consultation/${id}`);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not open.");
      return;
    }
    const data = (await res.json()) as Detail;
    setD(data);
    setDraft(data.consultation.notesDraft ?? "");
    setFinal(data.consultation.notesFinal ?? "");
    setPriv(data.consultation.notesPrivate ?? "");
    setNextSteps(data.consultation.nextSteps ?? "");
    setWarningSigns(data.consultation.warningSigns ?? "");
    setInperson(!!data.consultation.inpersonFlag);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(action: string, extra?: Record<string, unknown>) {
    setMsg("");
    const res = await fetch(`/api/queue/${id}/action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...(extra ?? {}) }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; note?: string };
    setMsg(data.note ?? data.error ?? "");
    if (res.ok && (action === "handoff" || action === "complete")) router.push("/doctor");
    else await load();
  }

  async function saveNotes() {
    const res = await fetch(`/api/doctor/consultation/${id}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ draft, final, private: priv, nextSteps, warningSigns, inpersonFlag: inperson }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; note?: string };
    setMsg(data.note ?? data.error ?? "");
  }

  async function markUseful(useful: boolean) {
    const res = await fetch(`/api/doctor/consultation/${id}/feedback`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ useful }),
    });
    setMsg(res.ok ? "Thank you — recorded." : "Could not send.");
  }

  async function sendRequest() {
    if (!reqMsg.trim()) return;
    const res = await fetch(`/api/doctor/consultation/${id}/request`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: reqMsg.trim() }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) setMsg(data.error ?? "Could not send.");
    else {
      setMsg("Request sent — short time limit, we will tell you if time runs out.");
      setReqMsg("");
      await load();
    }
  }

  async function flagAccuracy() {
    const res = await fetch(`/api/doctor/consultation/${id}/accuracy`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string; note?: string };
    setMsg(data.note ?? data.error ?? "");
    await load();
  }

  if (error) return <main><p role="alert">{error}</p></main>;
  if (!d) return <main><p>Opening… (this access is recorded)</p></main>;

  const answers = d.check.answers;
  const flat = Object.entries(answers).filter(
    ([k]) => !["caregiver", "context", "prefilled", "submitted", "specialty", "waitingNotes", "accuracyExplanation"].includes(k),
  );

  return (
    <main>
      <h1>{d.patient.name} — {d.check.complaint}</h1>
      {!d.caregiver.forSelf ? (
        <p className="mc-muted">
          Filled by caregiver{d.caregiver.relationship ? ` (${d.caregiver.relationship})` : ""}
          {d.caregiver.minorTick ? " · parent of young child" : ""}
          {d.caregiver.adultProof ? ` · ${d.caregiver.adultProof}` : ""}
        </p>
      ) : null}
      {d.consultation.feelingWorse ? <p><strong>Patient feels worse.</strong></p> : null}
      {d.check.accuracyFlag ? <p><strong>Marked “seems inaccurate” — patient can explain.</strong></p> : null}

      {d.openFlags.length > 0 ? (
        <section className="mc-card" aria-label="Open flags checklist">
          <h2>Open flags (close before sending, never blocking)</h2>
          <ul>{d.openFlags.map((f) => (<li key={f}>{f}</li>))}</ul>
        </section>
      ) : null}

      <section className="mc-card">
        <h2>Symptom check</h2>
        <ul className="mc-summary">
          {flat.map(([k, v]) => (
            <li key={k}><span className="mc-muted">{k}</span><span>{JSON.stringify(v)}</span></li>
          ))}
        </ul>
        {(answers.waitingNotes as { text: string; at: string }[] | undefined)?.length ? (
          <>
            <h2>Added while waiting</h2>
            <ul>
              {(answers.waitingNotes as { text: string; at: string }[]).map((n, i) => (
                <li key={i}>{n.text} <span className="mc-muted">({new Date(n.at).toLocaleString()})</span></li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="mc-card">
        <h2>History</h2>
        {d.history.length === 0 ? <p className="mc-muted">No earlier visits.</p> : (
          <ul>{d.history.map((h) => (<li key={h.id}>{h.complaint} <span className="mc-muted">({h.submittedAt ? new Date(h.submittedAt).toLocaleDateString() : ""})</span></li>))}</ul>
        )}
      </section>

      <section className="mc-card">
        <h2>Ask for more details</h2>
        <div className="mc-row">
          <input className="mc-input" value={reqMsg} onChange={(e) => setReqMsg(e.target.value)} placeholder="e.g. what is your temperature now?" style={{ flex: 1 }} />
          <button type="button" className="mc-btn" onClick={sendRequest}>Send request</button>
        </div>
        {d.requests.map((r) => (
          <p key={r.id} className="mc-muted">{r.message} — {r.status}{r.response ? `: “${r.response}”` : ""}</p>
        ))}
      </section>

      <section className="mc-card">
        <h2>Notes (review before the patient sees anything)</h2>
        <label>Working notes<br /><textarea className="mc-input" rows={4} style={{ width: "100%" }} value={draft} onChange={(e) => setDraft(e.target.value)} /></label>
        <br /><br />
        <label>Summary for the patient (plain words)<br /><textarea className="mc-input" rows={4} style={{ width: "100%" }} value={final} onChange={(e) => setFinal(e.target.value)} /></label>
        <br /><br />
        <label>For me only (never shown to the patient)<br /><textarea className="mc-input" rows={2} style={{ width: "100%" }} value={priv} onChange={(e) => setPriv(e.target.value)} /></label>
        <br /><br />
        <label>Next steps (plain words, stays on the timeline)<br /><textarea className="mc-input" rows={3} style={{ width: "100%" }} value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} /></label>
        <br /><br />
        <label>Warning signs — go to hospital if (plain words)<br /><textarea className="mc-input" rows={2} style={{ width: "100%" }} value={warningSigns} onChange={(e) => setWarningSigns(e.target.value)} /></label>
        <br /><br />
        <label className="mc-check">
          <input type="checkbox" checked={inperson} onChange={(e) => setInperson(e.target.checked)} />
          <span>Needs an in-person visit</span>
        </label>
        <br /><br />
        <div className="mc-row">
          <button type="button" className="mc-btn mc-btn-primary" onClick={saveNotes}>Save notes</button>
          <button type="button" className="mc-btn mc-btn-quiet" onClick={flagAccuracy}>Seems inaccurate</button>
          <button type="button" className="mc-btn mc-btn-quiet" onClick={() => markUseful(true)}>Summary was useful</button>
        </div>
      </section>

      {msg ? <p aria-live="polite">{msg}</p> : null}

      <div className="mc-row">
        <button type="button" className="mc-btn mc-btn-primary" onClick={() => act("ready")}>Doctor is ready</button>
        <button type="button" className="mc-btn mc-btn-quiet" onClick={() => act("missed")}>Patient missed</button>
        <button type="button" className="mc-btn mc-btn-quiet" onClick={() => act("handoff")}>Cannot continue — hand off</button>
        <button type="button" className="mc-btn" onClick={() => act("complete")}>Complete visit</button>
      </div>
    </main>
  );
}
