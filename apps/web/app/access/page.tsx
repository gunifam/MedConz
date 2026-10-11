import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accessLogs, user } from "@medconz/db";
import { ReportButton } from "./report-button";

export default async function AccessPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const rows = await db
    .select({
      id: accessLogs.id,
      whatOpened: accessLogs.whatOpened,
      reason: accessLogs.reason,
      createdAt: accessLogs.createdAt,
      actorName: user.name,
    })
    .from(accessLogs)
    .leftJoin(user, eq(user.id, accessLogs.actorId))
    .where(eq(accessLogs.patientId, session.user.id))
    .orderBy(desc(accessLogs.createdAt))
    .limit(100);

  return (
    <main>
      <h1>Who opened your record</h1>
      <p className="mc-muted">
        Every access is recorded: who, when and what was opened — never what was inside it.
      </p>
      {rows.length === 0 ? (
        <section className="mc-card">
          <p>No one has opened your record yet.</p>
        </section>
      ) : (
        <ul className="mc-summary">
          {rows.map((r) => (
            <li key={r.id}>
              <div>
                <div>
                  <strong>{r.actorName ?? "Someone on the MedConz team"}</strong> opened your{" "}
                  {r.whatOpened} on {new Date(r.createdAt).toLocaleString()}
                </div>
                {r.reason ? <div className="mc-muted">Reason given: {r.reason}</div> : null}
              </div>
              <ReportButton logId={r.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
