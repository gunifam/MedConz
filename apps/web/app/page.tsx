import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@medconz/db";
import { EmergencyBanner } from "@medconz/ui";
import { BrandLockup } from "@/components/brand";
import { InstallButton } from "@/components/install-button";

async function doctorCount(): Promise<number> {
  try {
    const all = await db.select({ role: user.role }).from(user);
    return all.filter((r) => r.role === "doctor" || r.role === "dentist").length;
  } catch {
    return 0;
  }
}

function DoctorLine({ n }: { n: number }) {
  return (
    <p className="mc-muted" aria-live="polite">
      {n > 0
        ? `${n} doctor${n === 1 ? "" : "s"} & dentists available right now.`
        : "Our doctors review every check — start any time."}
    </p>
  );
}

function DoctorCard() {
  return (
    <section className="mc-card" aria-label="For doctors">
      <h2>Are you a doctor or dentist?</h2>
      <p className="mc-muted">Join MedConz and start taking consultations.</p>
      <div className="mc-row">
        <a className="mc-btn mc-btn-quiet" href="/login">Doctor sign in</a>
        <a className="mc-btn" href="/signup?role=doctor">Join as a doctor</a>
      </div>
    </section>
  );
}

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const u = session?.user ?? null;
  const n = await doctorCount();

  if (!u) {
    return (
      <main>
        <EmergencyBanner>
          <strong>If this is an emergency, call for help now.</strong>
          <div>Emergency info is always free and always shown — no login needed. Call 112.</div>
        </EmergencyBanner>

        <section className="mc-hero">
          <BrandLockup />
          <h1>See a doctor or dentist today.</h1>
          <p>Answer a few questions, pay once with no hidden charges, and join the line. Your answers go straight to your doctor.</p>
          <div className="mc-row">
            <a className="mc-btn mc-btn-primary" href="/check">Start a symptom check</a>
            <InstallButton />
          </div>
          <DoctorLine n={n} />
        </section>

        <section className="mc-auth-card" aria-label="Your account">
          <h2>Your account</h2>
          <div className="mc-row" style={{ justifyContent: "center" }}>
            <a className="mc-btn mc-btn-primary" href="/login">Sign in</a>
            <a className="mc-btn" href="/signup">Sign up</a>
          </div>
          <p className="mc-muted">New here? Sign up takes a minute. Returning? Welcome back.</p>
        </section>

        <DoctorCard />
      </main>
    );
  }

  const me = await db.select().from(user).where(eq(user.id, u.id)).limit(1).catch(() => []);
  const role = (me[0] as { role?: string } | undefined)?.role ?? "patient";
  const clinical = role === "doctor" || role === "dentist" || role === "medical_team";
  const name = (u.name ?? "").split(" ")[0] || "there";

  return (
    <main>
      <EmergencyBanner>
        <strong>If this is an emergency, call for help now.</strong>
        <div>Emergency info is always free and always shown. Call 112.</div>
      </EmergencyBanner>

      <section className="mc-hero">
        <BrandLockup />
        <h1>Welcome back, {name}.</h1>
        <p>Start a new check, or pick up where you left off.</p>
        <div className="mc-row">
          <a className="mc-btn mc-btn-primary" href="/check">Start a symptom check</a>
          <InstallButton />
        </div>
        <DoctorLine n={n} />
      </section>

      <p className="mc-section-label">Your care</p>
      <div className="mc-actions">
        <a className="mc-action" href="/check">
          <strong>Check symptoms</strong>
          <span>Guided questions, ~5 minutes</span>
        </a>
        <a className="mc-action" href="/queue">
          <strong>The line</strong>
          <span>Your place, wait time, call-back</span>
        </a>
        <a className="mc-action" href="/timeline">
          <strong>Timeline</strong>
          <span>Checks, visits, downloads, sharing</span>
        </a>
        <a className="mc-action" href="/visits">
          <strong>Visits</strong>
          <span>Summaries, next steps, check-ins</span>
        </a>
      </div>

      {clinical ? (
        <>
          <p className="mc-section-label">Doctor</p>
          <nav className="mc-row" aria-label="Doctor">
            <a className="mc-btn mc-btn-primary" href="/doctor">Open the doctor line</a>
          </nav>
        </>
      ) : (
        <DoctorCard />
      )}
    </main>
  );
}
