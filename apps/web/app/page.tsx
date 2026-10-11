import { EmergencyBanner } from "@medconz/ui";
import { InstallButton } from "@/components/install-button";

export default function Home() {
  return (
    <main>
      <EmergencyBanner>
        <strong>If this is an emergency, call for help now.</strong>
        <div>Emergency info is always free and always shown — no login needed. Call 112.</div>
      </EmergencyBanner>

      <section className="mc-hero">
        <span className="mc-eyebrow">MedConz — doctors & dentists</span>
        <h1>See a doctor or dentist today.</h1>
        <p>Answer a few questions, pay once with no hidden charges, and join the line. Your answers go straight to your doctor.</p>
        <div className="mc-row">
          <a className="mc-btn mc-btn-primary" href="/check">Start a symptom check</a>
          <InstallButton />
        </div>
      </section>

      <section className="mc-auth-card" aria-label="Your account">
        <h2>Your account</h2>
        <div className="mc-row" style={{ justifyContent: "center" }}>
          <a className="mc-btn mc-btn-primary" href="/login">Sign in</a>
          <a className="mc-btn" href="/signup">Sign up</a>
        </div>
        <p className="mc-muted">New here? Sign up takes a minute. Returning? Welcome back.</p>
      </section>

      <p className="mc-section-label">Explore</p>
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

      <p className="mc-section-label">More</p>
      <nav className="mc-row" aria-label="More">
        <a className="mc-btn mc-btn-quiet" href="/doctor">I am a doctor</a>
        <a className="mc-btn mc-btn-quiet" href="/privacy">Privacy</a>
        <a className="mc-btn mc-btn-quiet" href="/access">Access record</a>
      </nav>
    </main>
  );
}
