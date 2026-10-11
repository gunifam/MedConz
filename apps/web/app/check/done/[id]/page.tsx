import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { symptomChecks } from "@medconz/db";
import { EmergencyBanner, SummaryReview } from "@medconz/ui";
import { EMERGENCY_NUMBERS, HOSPITAL_NOTE } from "@/lib/checks/content";
import type { Flag } from "@/lib/checks/emergency";

export default async function CheckDonePage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const rows = await db
    .select()
    .from(symptomChecks)
    .where(and(eq(symptomChecks.id, params.id), eq(symptomChecks.patientId, session.user.id)))
    .limit(1);
  const row = rows[0];
  if (!row) redirect("/check");
  if (row.status !== "submitted") redirect(`/check/${row.id}`);

  const flags = (row.flags ?? []) as Flag[];
  const answers = (row.answers ?? {}) as Record<string, unknown>;
  const specialty = (answers.specialty ?? {}) as { label?: string; reason?: string };
  const duration = (answers.duration ?? {}) as { value?: string; unit?: string };

  return (
    <main>
      <h1>Your answers are with us</h1>
      {flags.length > 0 ? (
        <EmergencyBanner>
          <div>Flagged for the doctor: {flags.map((f) => f.label).join("; ")}.</div>
          <ul>
            {EMERGENCY_NUMBERS.map((n) => (
              <li key={n.number}>{n.label}: <a href={`tel:${n.number}`}>{n.number}</a></li>
            ))}
          </ul>
          <div>{HOSPITAL_NOTE}</div>
        </EmergencyBanner>
      ) : null}
      <SummaryReview
        items={[
          { question: "What is wrong?", answer: row.chiefComplaint ?? "" },
          { question: "How long?", answer: `${duration.value ?? "?"} ${duration.unit ?? ""}` },
          { question: "How bad?", answer: `${(answers.severity as number | undefined) ?? "?"} of 10` },
        ]}
      />
      <section className="mc-card">
        <h2>Suggested doctor: {specialty.label ?? row.specialtySuggestion}</h2>
        <p>{specialty.reason ?? ""}</p>
        <p className="mc-muted">
          Your visit is saved to your timeline. Next: pay, then join the line for a doctor.
        </p>
        <a className="mc-btn mc-btn-primary" href={`/pay/${row.id}`}>
          Pay for consultation
        </a>
      </section>
    </main>
  );
}
