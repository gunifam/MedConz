import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { symptomChecks } from "@medconz/db";
import { Runner } from "./runner";

export default async function CheckRunPage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const rows = await db
    .select()
    .from(symptomChecks)
    .where(and(eq(symptomChecks.id, params.id), eq(symptomChecks.patientId, session.user.id)))
    .limit(1);
  const row = rows[0];
  if (!row) redirect("/check");
  if (row.status === "submitted") redirect(`/check/done/${row.id}`);
  return (
    <Runner
      checkId={row.id}
      complaint={row.chiefComplaint ?? ""}
      language={row.language ?? "en"}
      initialAnswers={(row.answers ?? {}) as Record<string, unknown>}
    />
  );
}
