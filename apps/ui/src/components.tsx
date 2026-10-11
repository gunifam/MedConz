import type { ReactNode } from "react";
import { uiCss } from "./tokens";

/** Mount once in the app layout. Ships all .mc-* styles. */
export function MedConzStyles() {
  // eslint-disable-next-line react/no-danger
  return <style dangerouslySetInnerHTML={{ __html: uiCss }} />;
}

// ---------- Banners ----------

export function EmergencyBanner({
  title = "If this is an emergency, get help now.",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div role="alert" className="mc-banner mc-banner-emergency">
      <strong>{title}</strong>
      <div>{children}</div>
    </div>
  );
}

export function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="mc-banner mc-banner-info">
      {children}
    </div>
  );
}

// ---------- Question flow ----------

export function QuestionCard({
  title,
  stepText,
  children,
  onBack,
  onSkip,
  skipLabel = "Skip",
}: {
  title: string;
  stepText?: string;
  children: ReactNode;
  onBack?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  return (
    <section className="mc-card" aria-label={title}>
      {stepText ? <p className="mc-step">{stepText}</p> : null}
      <h2>{title}</h2>
      {children}
      {(onBack || onSkip) && (
        <div className="mc-row" style={{ marginTop: 12 }}>
          {onBack ? (
            <button type="button" className="mc-btn mc-btn-quiet" onClick={onBack}>
              Back
            </button>
          ) : null}
          {onSkip ? (
            <button type="button" className="mc-btn mc-btn-quiet" onClick={onSkip}>
              {skipLabel}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div>
      <p className="mc-step" aria-live="polite">
        Question {current} of {total}
      </p>
      <div
        className="mc-progress"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Question ${current} of ${total}`}
      >
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export type ChipOption = { value: string; label: string };

export function AnswerChips({
  options,
  selected,
  onToggle,
  multi = true,
  label,
}: {
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
  multi?: boolean;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} aria-multiselectable={multi}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="mc-chip"
          aria-pressed={selected.includes(o.value)}
          onClick={() => onToggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Backwards-compatible single tap button (used on home page). */
export function AnswerButton({
  children,
  onClick,
  selected,
}: {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      className="mc-btn"
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function severityLabel(value: number): string {
  if (value <= 3) return "Mild";
  if (value <= 6) return "Moderate";
  if (value <= 8) return "Severe";
  return "Worst";
}

export function SeveritySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label htmlFor="mc-severity">
        How bad is it? <strong>{value} — {severityLabel(value)}</strong>
      </label>
      <input
        id="mc-severity"
        type="range"
        className="mc-slider"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value}, ${severityLabel(value)}`}
      />
      <div className="mc-row" aria-hidden="true">
        <span className="mc-muted">0 No pain</span>
        <span className="mc-muted" style={{ marginLeft: "auto" }}>
          10 Worst
        </span>
      </div>
    </div>
  );
}

// ---------- Review / consent ----------

export type SummaryItem = { question: string; answer: string; onEdit?: () => void };

export function SummaryReview({
  items,
  disclaimer = "This is not a diagnosis. A doctor will review your answers.",
  onConfirm,
  confirmLabel = "Send to doctor",
}: {
  items: SummaryItem[];
  disclaimer?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
}) {
  return (
    <section className="mc-card" aria-label="Review your answers">
      <h2>Check your answers</h2>
      <ul className="mc-summary">
        {items.map((it) => (
          <li key={it.question}>
            <div>
              <div className="mc-muted">{it.question}</div>
              <div>{it.answer}</div>
            </div>
            {it.onEdit ? (
              <button type="button" className="mc-btn mc-btn-quiet" onClick={it.onEdit}>
                Edit
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mc-muted">{disclaimer}</p>
      {onConfirm ? (
        <button type="button" className="mc-btn mc-btn-primary" onClick={onConfirm}>
          {confirmLabel}
        </button>
      ) : null}
    </section>
  );
}

export function ConsentCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
}) {
  return (
    <label className="mc-check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

// ---------- Language ----------

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ha", label: "Hausa" },
  { value: "yo", label: "Yoruba" },
  { value: "ig", label: "Igbo" },
] as const;

export function LanguageSwitcher({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="mc-row">
      <span className="mc-muted">Language</span>
      <select
        className="mc-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Change language — answers are kept"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ---------- Queue / waiting ----------

export function QueueStatus({
  etaText,
  positionText,
  safe = false,
  detail,
  onJoin,
  onSnooze,
}: {
  etaText: string;
  positionText?: string;
  /** Safe mode: lock-screen friendly, no health details. */
  safe?: boolean;
  detail?: string;
  onJoin?: () => void;
  onSnooze?: () => void;
}) {
  return (
    <section className="mc-card" aria-label="Waiting status" aria-live="polite">
      <h2>{safe ? "Your doctor is ready" : etaText}</h2>
      {safe ? null : (
        <>
          {positionText ? <p>{positionText}</p> : null}
          {detail ? <p className="mc-muted">{detail}</p> : null}
        </>
      )}
      <div className="mc-row">
        {onJoin ? (
          <button type="button" className="mc-btn mc-btn-primary" onClick={onJoin}>
            {safe ? "Join now" : "Join consultation"}
          </button>
        ) : null}
        {onSnooze && !safe ? (
          <button type="button" className="mc-btn mc-btn-quiet" onClick={onSnooze}>
            Give me a minute
          </button>
        ) : null}
      </div>
    </section>
  );
}

// ---------- Timeline / payment / sharing ----------

export function TimelineNode({
  kind,
  title,
  date,
  seenBy,
  onOpen,
  onDelete,
}: {
  kind: "check" | "consultation" | "note";
  title: string;
  date: string;
  seenBy?: string;
  onOpen?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className={`mc-node mc-node-${kind}`}>
      <div>
        <strong>{title}</strong>
      </div>
      <div className="mc-muted">
        {date}
        {seenBy ? ` · Seen by ${seenBy}` : ""}
      </div>
      <div className="mc-row">
        {onOpen ? (
          <button type="button" className="mc-btn mc-btn-quiet" onClick={onOpen}>
            Open
          </button>
        ) : null}
        {onDelete ? (
          <button type="button" className="mc-btn mc-btn-quiet" onClick={onDelete}>
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ReceiptCard({
  amount,
  currency,
  ngnValue,
  date,
  receiptId,
  status = "Paid",
}: {
  amount: string;
  currency: string;
  ngnValue: string;
  date: string;
  receiptId: string;
  status?: string;
}) {
  return (
    <section className="mc-card" aria-label="Payment receipt">
      <h2>Receipt</h2>
      <ul className="mc-summary">
        <li>
          <span className="mc-muted">Amount paid</span>
          <strong>
            {amount} {currency}
          </strong>
        </li>
        <li>
          <span className="mc-muted">Value in Naira</span>
          <span>{ngnValue} NGN</span>
        </li>
        <li>
          <span className="mc-muted">Date</span>
          <span>{date}</span>
        </li>
        <li>
          <span className="mc-muted">Receipt</span>
          <span>{receiptId}</span>
        </li>
        <li>
          <span className="mc-muted">Status</span>
          <span>{status}</span>
        </li>
      </ul>
    </section>
  );
}

export function ShareDialog({
  scope,
  onScopeChange,
  expiryDays,
  onExpiryChange,
  active,
  onConfirm,
  onCancel,
  onRevoke,
}: {
  scope: string;
  onScopeChange: (v: string) => void;
  expiryDays: number;
  onExpiryChange: (v: number) => void;
  active: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onRevoke?: () => void;
}) {
  return (
    <div className="mc-dialog" role="dialog" aria-modal="true" aria-label="Share your record">
      <div className="mc-dialog-box">
        <h2>Share your record</h2>
        <p className="mc-muted">
          Only share what is needed. Links need a code and stop working when they
          expire or when you cancel them.
        </p>
        <div className="mc-row">
          <label>
            <span className="mc-muted">What to include</span>
            <br />
            <select
              className="mc-select"
              value={scope}
              onChange={(e) => onScopeChange(e.target.value)}
            >
              <option value="6m">Last 6 months</option>
              <option value="1y">Last 12 months</option>
              <option value="all">Everything</option>
            </select>
          </label>
          <label>
            <span className="mc-muted">Link works for</span>
            <br />
            <select
              className="mc-select"
              value={expiryDays}
              onChange={(e) => onExpiryChange(Number(e.target.value))}
            >
              <option value={1}>1 day</option>
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
            </select>
          </label>
        </div>
        <div className="mc-row" style={{ marginTop: 16 }}>
          <button type="button" className="mc-btn mc-btn-primary" onClick={onConfirm}>
            Create link
          </button>
          {active && onRevoke ? (
            <button type="button" className="mc-btn" onClick={onRevoke}>
              Cancel this link
            </button>
          ) : null}
          <button type="button" className="mc-btn mc-btn-quiet" onClick={onCancel}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
