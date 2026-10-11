"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnswerChips,
  EmergencyBanner,
  InfoBanner,
  ProgressBar,
  QuestionCard,
  SeveritySlider,
  SummaryReview,
} from "@medconz/ui";
import { t, type Lang } from "@medconz/i18n";
import {
  BRANCHES,
  CONTEXT_QUESTIONS,
  DURATION_OPTIONS,
  EMERGENCY_NUMBERS,
  HOSPITAL_NOTE,
  classifyBranch,
  type ChipQ,
} from "@/lib/checks/content";
import { confirmQuestions, evaluateEmergency } from "@/lib/checks/emergency";
import { loadLocalDraft, saveGuest, saveLocalDraft } from "@/lib/checks/drafts";

type Answers = Record<string, unknown>;
type Step =
  | { kind: "duration" }
  | { kind: "severity" }
  | { kind: "chip"; q: ChipQ }
  | { kind: "confirm"; q: ChipQ }
  | { kind: "context"; q: ChipQ }
  | { kind: "review" };

function buildSteps(complaint: string): Step[] {
  const branch = classifyBranch(complaint);
  const steps: Step[] = [{ kind: "duration" }, { kind: "severity" }];
  for (const q of branch.questions) steps.push({ kind: "chip", q });
  for (const c of confirmQuestions(evaluateEmergency({ text: complaint }))) {
    steps.push({
      kind: "confirm",
      q: { id: c.id, text: c.text, options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }], multi: false },
    });
  }
  for (const q of CONTEXT_QUESTIONS) steps.push({ kind: "context", q });
  steps.push({ kind: "review" });
  return steps;
}

const branchOf = (complaint: string) => classifyBranch(complaint).id;

export function Runner({
  checkId,
  complaint,
  language,
  initialAnswers,
  guest = false,
}: {
  checkId: string;
  complaint: string;
  language: string;
  initialAnswers: Answers;
  guest?: boolean;
}) {
  const router = useRouter();
  const lang = (language as Lang) ?? "en";
  const steps = useMemo(() => buildSteps(complaint), [complaint]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => {
    try {
      const local = loadLocalDraft(checkId);
      if (local && Object.keys(local.answers).length >= Object.keys(initialAnswers).length) {
        return local.answers;
      }
    } catch { /* ignore */ }
    return initialAnswers;
  });
  const [online, setOnline] = useState(true);
  const [savedTick, setSavedTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Autosave: server (+ local mirror) when signed in, phone-only as guest.
  useEffect(() => {
    if (guest) {
      saveGuest({
        complaint,
        language,
        caregiver: (initialAnswers.caregiver ?? { forSelf: true }) as Record<string, unknown>,
        answers,
        updatedAt: new Date().toISOString(),
      });
      setSavedTick((n) => n + 1);
      return;
    }
    saveLocalDraft(checkId, { id: checkId, complaint, answers, updatedAt: new Date().toISOString() });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await fetch(`/api/checks/${checkId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        setSavedTick((n) => n + 1);
      } catch { /* offline — local draft + retry on next change */ }
    }, 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [answers, checkId, complaint]);

  const flags = useMemo(() => evaluateEmergency({ text: complaint, answers }), [complaint, answers]);
  const step = steps[idx];

  const set = (patch: Answers) => setAnswers((a) => ({ ...a, ...patch }));
  const toggleChip = (id: string, value: string, multi: boolean) =>
    setAnswers((a) => {
      const cur = (a[id] as string[] | undefined) ?? [];
      const next = cur.includes(value)
        ? cur.filter((x) => x !== value)
        : multi
          ? [...cur, value]
          : [value];
      return { ...a, [id]: next };
    });

  const duration = (answers.duration ?? {}) as { value?: string; unit?: string };
  const severity = answers.severity as number | undefined;
  const canNext =
    step.kind === "duration" ? !!(duration.value && duration.unit) :
    step.kind === "severity" ? typeof severity === "number" :
    true;

  async function send() {
    setError("");
    if (guest) {
      // Next stage needs an account: sign in/up, then we finish server-side.
      saveGuest({
        complaint,
        language,
        caregiver: (initialAnswers.caregiver ?? { forSelf: true }) as Record<string, unknown>,
        answers,
        updatedAt: new Date().toISOString(),
      });
      router.push("/signup?next=/check/finish");
      return;
    }
    setBusy(true);
    try {
      await fetch(`/api/checks/${checkId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
    } catch { /* submit below is source of truth */ }
    const res = await fetch(`/api/checks/${checkId}/submit`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not send. Your answers are saved — try again.");
      setBusy(false);
      return;
    }
    router.push(`/check/done/${checkId}`);
  }

  function reviewItems() {
    const items: { question: string; answer: string; go: number }[] = [
      { question: t(lang, "start_what"), answer: complaint, go: -1 },
      {
        question: t(lang, "qs_duration"),
        answer: `${duration.value ?? "?"} ${duration.unit ?? ""}`,
        go: steps.findIndex((s) => s.kind === "duration"),
      },
      {
        question: t(lang, "qs_severity"),
        answer: typeof severity === "number" ? `${severity} of 10` : "?",
        go: steps.findIndex((s) => s.kind === "severity"),
      },
    ];
    steps.forEach((s, i) => {
      if (s.kind !== "chip" && s.kind !== "confirm" && s.kind !== "context") return;
      const v = answers[s.q.id] as string[] | undefined;
      if (!v || v.length === 0) return;
      const labels = v
        .map((x) => s.q.options.find((o) => o.value === x)?.label ?? x)
        .join(", ");
      const free = answers[`${s.q.id}_text`] as string | undefined;
      items.push({
        question: s.q.text + (s.kind === "context" && (initialAnswers.context as Record<string, unknown> | undefined)?.[s.q.id] ? ` (${t(lang, "still_true")})` : ""),
        answer: free ? `${labels} — ${free}` : labels,
        go: i,
      });
    });
    return items;
  }

  return (
    <main>
      <ProgressBar current={Math.min(idx + 1, steps.length)} total={steps.length} />
      {!online ? <InfoBanner>Your connection is weak. Your answers are saved.</InfoBanner> : null}
      {savedTick > 0 && online ? <p className="mc-muted" aria-live="polite">Saved.</p> : null}

      {flags.length > 0 ? (
        <EmergencyBanner>
          <div>This sounds serious: {flags.map((f) => f.label).join("; ")}.</div>
          <ul>
            {EMERGENCY_NUMBERS.map((n) => (
              <li key={n.number}>{n.label}: <a href={`tel:${n.number}`}>{n.number}</a></li>
            ))}
          </ul>
          <div>{HOSPITAL_NOTE}</div>
          <div>You can still continue below if this is not an emergency.</div>
        </EmergencyBanner>
      ) : null}

      {step.kind === "duration" ? (
        <QuestionCard title={t(lang, "qs_duration")}>
          <label>
            <span className="mc-muted">Number</span>
            <br />
            <input
              className="mc-input"
              type="number"
              min={1}
              value={duration.value ?? ""}
              onChange={(e) => set({ duration: { ...duration, value: e.target.value } })}
            />
          </label>
          <br />
          <br />
          <div role="group" aria-label={t(lang, "qs_duration")}>
            {DURATION_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className="mc-chip"
                aria-pressed={duration.unit === o.value}
                onClick={() => set({ duration: { ...duration, unit: o.value } })}
              >
                {t(lang, o.labelKey)}
              </button>
            ))}
          </div>
        </QuestionCard>
      ) : null}

      {step.kind === "severity" ? (
        <QuestionCard title={t(lang, "qs_severity")}>
          <SeveritySlider value={severity ?? 5} onChange={(v) => set({ severity: v })} />
        </QuestionCard>
      ) : null}

      {step.kind === "chip" || step.kind === "confirm" ? (
        <QuestionCard
          title={step.q.text}
          onSkip={() => setIdx(Math.min(idx + 1, steps.length - 1))}
          skipLabel={t(lang, "skip")}
        >
          <p className="mc-muted">{t(lang, "skip_nudge")}</p>
          <AnswerChips
            label={step.q.text}
            multi={step.q.multi}
            options={step.q.options}
            selected={(answers[step.q.id] as string[] | undefined) ?? []}
            onToggle={(v) => toggleChip(step.q.id, v, step.q.multi)}
          />
        </QuestionCard>
      ) : null}

      {step.kind === "context" ? (
        <QuestionCard
          title={step.q.text}
          onSkip={() => setIdx(Math.min(idx + 1, steps.length - 1))}
          skipLabel={t(lang, "skip")}
        >
          {(initialAnswers.context as Record<string, unknown> | undefined)?.[step.q.id] ? (
            <p className="mc-muted">
              {t(lang, "still_true")} Last time:{" "}
              {JSON.stringify((initialAnswers.context as Record<string, unknown>)[step.q.id])}
            </p>
          ) : null}
          <AnswerChips
            label={step.q.text}
            multi={false}
            options={step.q.options}
            selected={(answers[step.q.id] as string[] | undefined) ?? []}
            onToggle={(v) => toggleChip(step.q.id, v, false)}
          />
          {((answers[step.q.id] as string[] | undefined) ?? []).includes("yes") ? (
            <div>
              <br />
              <label>
                <span className="mc-muted">Type them here</span>
                <br />
                <textarea
                  className="mc-input"
                  rows={2}
                  style={{ width: "100%" }}
                  value={(answers[`${step.q.id}_text`] as string | undefined) ?? ""}
                  onChange={(e) => set({ [`${step.q.id}_text`]: e.target.value })}
                />
              </label>
            </div>
          ) : null}
        </QuestionCard>
      ) : null}

      {step.kind === "review" ? (
        <>
          {guest ? (
            <InfoBanner>
              To send this to a doctor, sign in or sign up next — your answers stay saved on this phone.
            </InfoBanner>
          ) : null}
          <SummaryReview
          items={reviewItems().map((it) => ({
            question: it.question,
            answer: it.answer,
            onEdit: it.go >= 0 ? () => setIdx(it.go) : undefined,
          }))}
          disclaimer={t(lang, "not_diagnosis")}
          confirmLabel={t(lang, "send")}
          onConfirm={send}
        />
        </>
      ) : null}

      {error ? <p role="alert">{error}</p> : null}

      {step.kind !== "review" ? (
        <div className="mc-row">
          {idx > 0 ? (
            <button type="button" className="mc-btn mc-btn-quiet" onClick={() => setIdx(idx - 1)}>
              {t(lang, "back")}
            </button>
          ) : null}
          <button
            type="button"
            className="mc-btn mc-btn-primary"
            disabled={!canNext}
            onClick={() => setIdx(Math.min(idx + 1, steps.length - 1))}
          >
            {t(lang, "continue")}
          </button>
        </div>
      ) : null}

      <p className="mc-muted">Branch: {branchOf(complaint)} · answers autosave as you go.</p>
    </main>
  );
}
