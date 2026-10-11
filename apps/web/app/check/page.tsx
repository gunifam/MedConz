import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { symptomChecks, user } from "@medconz/db";
import { StartForm } from "./start-form";

export default async function CheckStartPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const me = (
    await db.select().from(user).where(eq(user.id, session.user.id)).limit(1)
  )[0];
  const drafts = await db
    .select({
      id: symptomChecks.id,
      chiefComplaint: symptomChecks.chiefComplaint,
      updatedAt: symptomChecks.updatedAt,
    })
    .from(symptomChecks)
    .where(and(eq(symptomChecks.patientId, session.user.id), eq(symptomChecks.status, "draft")))
    .orderBy(desc(symptomChecks.updatedAt))
    .limit(5);
  const onlyDrafts = drafts.filter((d) => d);
  return (
    <StartForm
      initialLang={me?.preferredLanguage ?? "en"}
      drafts={onlyDrafts.map((d) => ({
        id: d.id,
        complaint: d.chiefComplaint ?? "",
        updatedAt: d.updatedAt?.toISOString() ?? "",
      }))}
    />
  );
}
