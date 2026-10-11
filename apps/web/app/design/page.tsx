"use client";

import { useState } from "react";
import {
  AnswerChips,
  ConsentCheckbox,
  EmergencyBanner,
  InfoBanner,
  LanguageSwitcher,
  ProgressBar,
  QuestionCard,
  QueueStatus,
  ReceiptCard,
  SeveritySlider,
  ShareDialog,
  SummaryReview,
  TimelineNode,
} from "@medconz/ui";

export default function DesignShowcase() {
  const [chips, setChips] = useState<string[]>(["fever"]);
  const [severity, setSeverity] = useState(6);
  const [lang, setLang] = useState("en");
  const [consent, setConsent] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [scope, setScope] = useState("6m");
  const [expiry, setExpiry] = useState(7);

  const toggle = (v: string) =>
    setChips((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  return (
    <main>
      <h1>MedConz design system</h1>
      <p>
        Phase 1 showcase. Every component below is in <code>@medconz/ui</code>.
        Base text 17px, questions 22px, 48px touch targets, English/Hausa/Yoruba/Igbo ready.
      </p>

      <LanguageSwitcher value={lang} onChange={setLang} />

      <EmergencyBanner>
        <div>Emergency numbers and nearby hospitals always show here — even offline, even before payment.</div>
      </EmergencyBanner>

      <InfoBanner>Your connection is weak. Your answers are saved.</InfoBanner>

      <QuestionCard title="What is wrong today?" stepText="Welcome back. You were on question 6 of 10.">
        <ProgressBar current={6} total={10} />
        <AnswerChips
          label="Common problems"
          multi
          options={[
            { value: "fever", label: "Fever" },
            { value: "tooth", label: "Toothache" },
            { value: "cough", label: "Cough" },
          ]}
          selected={chips}
          onToggle={toggle}
        />
        <SeveritySlider value={severity} onChange={setSeverity} />
      </QuestionCard>

      <SummaryReview
        items={[
          { question: "What is wrong?", answer: "Toothache, 3 days" },
          { question: "How bad?", answer: `${severity} of 10` },
        ]}
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        label="I agree MedConz keeps my answers private and only uses them for my care, unless I allow more."
      />

      <QueueStatus
        etaText="About 8 minutes"
        positionText="We are seeing some patients first based on their answers."
        detail="You can leave — we will call you back without losing your place."
      />

      <QueueStatus etaText="" safe onJoin={() => {}} />

      <section className="mc-card">
        <h2>Your timeline</h2>
        <div className="mc-timeline">
          <TimelineNode kind="check" title="Toothache check" date="10 Oct 2026" />
          <TimelineNode kind="consultation" title="Visit" date="10 Oct 2026" seenBy="Dr. Ade" />
        </div>
      </section>

      <ReceiptCard
        amount="2"
        currency="Espees"
        ngnValue="4,100"
        date="10 Oct 2026"
        receiptId="MCZ-0001"
      />

      <section className="mc-card">
        <h2>Sharing</h2>
        <button type="button" className="mc-btn" onClick={() => setShareOpen(true)}>
          Share record
        </button>
      </section>
      {shareOpen ? (
        <ShareDialog
          scope={scope}
          onScopeChange={setScope}
          expiryDays={expiry}
          onExpiryChange={setExpiry}
          active={false}
          onConfirm={() => setShareOpen(false)}
          onCancel={() => setShareOpen(false)}
        />
      ) : null}
    </main>
  );
}
