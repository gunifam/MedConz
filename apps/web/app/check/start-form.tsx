"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmergencyBanner, InfoBanner, LanguageSwitcher, QuestionCard } from "@medconz/ui";
import { t, type Lang } from "@medconz/i18n";
import { EMERGENCY_NUMBERS, HOSPITAL_NOTE } from "@/lib/checks/content";
import { evaluateEmergency } from "@/lib/checks/emergency";

export type DraftItem = { id: string; complaint: string; updatedAt: string };

const WALK: { title: string; body: string }[] = [
  { title: "What this check is for", body: "A few questions prepare you and the doctor, so the visit starts faster." },
  { title: "Who sees your answers", body: "You, the doctor you consult, and future doctors. Payment details are never shown to doctors." },
  { title: "Not a diagnosis", body: "This check never diagnoses. A doctor reviews your answers. In an emergency, call for help now." },
];

export function StartForm({ initialLang, drafts }: { initialLang: string; drafts: DraftItem[] }) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>((initialLang as Lang) ?? "en");
  const [walk, setWalk] = useState(() => {
    try {
      return localStorage.getItem("medconz:walkthrough") ? -1 : 0;
    } catch {
      return -1;
    }
  });
  const [complaint, setComplaint] = useState("");
  const [forSelf, setForSelf] = useState(true);
  const [relationship, setRelationship] = useState("");
  const [minorTick, setMinorTick] = useState(false);
  const [adultProof, setAdultProof] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const flags = useMemo(() => evaluateEmergency({ text: complaint }), [complaint]);

  function closeWalk() {
    try {
      localStorage.setItem("medconz:walkthrough", "seen");
    } catch { /* ignore */ }
    setWalk(-1);
  }

  async function start() {
    setError("");
    if (!complaint.trim()) {
      setError(t(lang, "start_what"));
      return;
    }
    if (!forSelf) {
      if (!relationship.trim()) {
        setError(t(lang, "relationship"));
        return;
      }
      if (!minorTick && !adultProof) {
        setError(t(lang, "adult_ok"));
        return;
      }
    }
    setBusy(true);
    const res = await fetch("/api/checks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        complaint: complaint.trim(),
        language: lang,
        caregiver: forSelf
          ? { forSelf: true }
          : { forSelf: false, relationship, minorTick, adultProof },
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    if (!res.ok || !data.id) {
      setError(data.error ?? "Could not start. Check your connection — drafts stay on this phone.");
      setBusy(false);
      return;
    }
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ preferredLanguage: lang }),
    }).catch(() => {});
    router.push(`/check/${data.id}`);
  }

  return (
    <main>
      <h1>{t(lang, "start_title")}</h1>
      <LanguageSwitcher value={lang} onChange={(v) => setLang(v as Lang)} />

      {walk >= 0 ? (
        <div className="mc-dialog" role="dialog" aria-modal="true" aria-label="Welcome">
          <div className="mc-dialog-box">
            <p className="mc-step">Welcome {walk + 1} of {WALK.length} — <button type="button" className="mc-btn mc-btn-quiet" onClick={closeWalk}>Skip tour</button></p>
            <h2>{WALK[walk].title}</h2>
            <p>{WALK[walk].body}</p>
            <div className="mc-row">
              {walk < WALK.length - 1 ? (
                <button type="button" className="mc-btn mc-btn-primary" onClick={() => setWalk(walk + 1)}>Next</button>
              ) : (
                <button type="button" className="mc-btn mc-btn-primary" onClick={closeWalk}>Start</button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <EmergencyBanner title={t(lang, "emergency_first")}>
        <ul>
          {EMERGENCY_NUMBERS.map((n) => (
            <li key={n.number}>{n.label}: <a href={`tel:${n.number}`}>{n.number}</a></li>
          ))}
        </ul>
      </EmergencyBanner>

      <InfoBanner>{t(lang, "honesty")}</InfoBanner>

      {drafts.length > 0 ? (
        <section className="mc-card" aria-label={t(lang, "resume_title")}>
          <h2>{t(lang, "resume_title")}</h2>
          <ul className="mc-summary">
            {drafts.map((d) => (
              <li key={d.id}>
                <span>{d.complaint || "(no complaint yet)"}</span>
                <button type="button" className="mc-btn mc-btn-quiet" onClick={() => router.push(`/check/${d.id}`)}>
                  {t(lang, "continue")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <QuestionCard title={t(lang, "start_what")}>
        <div className="mc-row" role="radiogroup" aria-label="Who is this for">
          <button type="button" className="mc-chip" aria-pressed={forSelf} onClick={() => setForSelf(true)}>
            {t(lang, "who_self")}
          </button>
          <button type="button" className="mc-chip" aria-pressed={!forSelf} onClick={() => setForSelf(false)}>
            {t(lang, "who_other")}
          </button>
        </div>
        {!forSelf ? (
          <div>
            <label>
              {t(lang, "relationship")}
              <br />
              <input
                className="mc-input"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder={t(lang, "relationship_ph")}
              />
            </label>
            <br />
            <br />
            <label className="mc-check">
              <input type="checkbox" checked={minorTick} onChange={(e) => setMinorTick(e.target.checked)} />
              <span>{t(lang, "minor_tick")}</span>
            </label>
            {!minorTick ? (
              <div className="mc-row" role="radiogroup" aria-label="Adult consent">
                {[
                  { v: "agreed", l: t(lang, "adult_ok") },
                  { v: "trusted", l: t(lang, "adult_trusted") },
                  { v: "cannot", l: t(lang, "adult_cannot") },
                ].map((o) => (
                  <button key={o.v} type="button" className="mc-chip" aria-pressed={adultProof === o.v} onClick={() => setAdultProof(o.v)}>
                    {o.l}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <br />
        <label>
          <span className="mc-muted">{t(lang, "start_what")}</span>
          <br />
          <textarea
            className="mc-input"
            rows={3}
            style={{ width: "100%" }}
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            placeholder={t(lang, "start_what_ph")}
          />
        </label>
        {flags.length > 0 ? (
          <EmergencyBanner>
            <div>This sounds serious: {flags.map((f) => f.label).join("; ")}.</div>
            <div>{HOSPITAL_NOTE}</div>
            <div>You can still continue to a doctor below.</div>
          </EmergencyBanner>
        ) : null}
        {error ? <p role="alert">{error}</p> : null}
        <br />
        <button type="button" className="mc-btn mc-btn-primary" disabled={busy} onClick={start}>
          {t(lang, "continue")}
        </button>
      </QuestionCard>
    </main>
  );
}
