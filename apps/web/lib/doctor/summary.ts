// Visit-summary draft builder. Templated from the check — the doctor MUST
// review and edit before the patient ever sees it (PRD 9.3). No LLM, no
// invented facts: only what the patient entered.

export function buildSummaryDraft(input: {
  complaint: string;
  duration?: { value?: string; unit?: string };
  severity?: number;
  branchAnswers: { question: string; answer: string }[];
  flags: { label: string }[];
}): string {
  const lines = [`Reason for visit: ${input.complaint || "(not given)"}`];
  if (input.duration?.value || input.duration?.unit) {
    lines.push(`How long: ${input.duration.value ?? "?"} ${input.duration.unit ?? ""}`.trim());
  }
  if (typeof input.severity === "number") {
    lines.push(`How bad (patient rating): ${input.severity} of 10`);
  }
  for (const b of input.branchAnswers) {
    lines.push(`${b.question} ${b.answer}`);
  }
  if (input.flags.length > 0) {
    lines.push(`Open flags for the doctor to close: ${input.flags.map((f) => f.label).join("; ")}`);
  }
  lines.push("", "Doctor: review every line above, then write the plan in plain words.");
  return lines.join("\n");
}
