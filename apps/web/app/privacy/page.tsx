import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@medconz/db";
import { ConsentButtons } from "./buttons";

export default async function PrivacyPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const rows = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  const acceptedAt = rows[0]?.consentAcceptedAt ?? null;

  return (
    <main>
      <h1>Your privacy</h1>
      <section className="mc-card">
        <h2>Our promise</h2>
        <p>
          Your health information is strictly confidential. It is used for your
          care, and for quality checks and support only with your consent.
          MedConz follows medical industry ethics.
        </p>
        <ul>
          <li>You, the doctor you consult, and future doctors can see your answers.</li>
          <li>Payment details are never shown to doctors.</li>
          <li>Everything a doctor opens is recorded, and you can see that record.</li>
          <li>
            Deleted entries leave your and your doctors&apos; view right away and
            are erased for good after 6 months.
          </li>
        </ul>
        <p>
          Status:{" "}
          <strong>
            {acceptedAt ? `Agreed on ${new Date(acceptedAt).toLocaleDateString()}` : "Not agreed"}
          </strong>
        </p>
        <ConsentButtons accepted={!!acceptedAt} />
      </section>
      <p>
        <a className="mc-link" href="/access">See who opened your record</a>
      </p>
    </main>
  );
}
