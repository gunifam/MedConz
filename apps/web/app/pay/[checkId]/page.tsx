import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { symptomChecks } from "@medconz/db";
import { PayScreen } from "./pay-screen";

export default async function PayPage({ params }: { params: { checkId: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const rows = await db
    .select({ id: symptomChecks.id })
    .from(symptomChecks)
    .where(and(eq(symptomChecks.id, params.checkId), eq(symptomChecks.patientId, session.user.id)))
    .limit(1);
  if (rows.length === 0) redirect("/check");
  return <PayScreen checkId={params.checkId} />;
}
