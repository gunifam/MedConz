import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { symptomChecks, user } from "@medconz/db";
import { StartForm } from "./start-form";

// Guests may start a check (item 6): only the final send needs an account.
export default async function CheckStartPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const authed = !!session?.user;
  const me = authed
    ? (await db.select().from(user).where(eq(user.id, session!.user.id)).limit(1))[0]
    : null;
  const drafts = authed
    ? (
        await db
          .select({
            id: symptomChecks.id,
            chiefComplaint: symptomChecks.chiefComplaint,
            updatedAt: symptomChecks.updatedAt,
          })
          .from(symptomChecks)
          .where(
            and(
              eq(symptomChecks.patientId, session!.user.id),
              eq(symptomChecks.status, "draft"),
            ),
          )
          .orderBy(desc(symptomChecks.updatedAt))
          .limit(5)
      )
    : [];
  return (
    <StartForm
      initialLang={me?.preferredLanguage ?? "en"}
      authed={authed}
      drafts={drafts.map((d) => ({
        id: d.id,
        complaint: d.chiefComplaint ?? "",
        updatedAt: d.updatedAt?.toISOString() ?? "",
      }))}
    />
  );
}
