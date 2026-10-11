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
          <a className="mc-btn mc-btn-quiet" href="/login">Sign in</a>
          <InstallButton />
        </div>
      </section>

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

      <nav className="mc-row" aria-label="Account">
        <a className="mc-btn mc-btn-quiet" href="/signup">Create account</a>
        <a className="mc-btn mc-btn-quiet" href="/doctor">I am a doctor</a>
        <a className="mc-btn mc-btn-quiet" href="/privacy">Privacy</a>
        <a className="mc-btn mc-btn-quiet" href="/access">Access record</a>
        <a className="mc-btn mc-btn-quiet" href="/design">Design system</a>
      </nav>
    </main>
  );
}
