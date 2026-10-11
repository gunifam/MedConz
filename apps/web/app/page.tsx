import { EmergencyBanner, QuestionCard, AnswerButton } from "@medconz/ui";

export default function Home() {
  return (
    <main>
      <h1>MedConz</h1>
      <p>Symptom check, timeline and paid consultation. Local dev build.</p>

      <EmergencyBanner>
        <strong>If this is an emergency, call for help now.</strong>
        <div>Emergency info is always free and always shown — no login needed.</div>
      </EmergencyBanner>

      <div className="card">
        <h2>Stack status</h2>
        <ul>
          <li>DB: local Postgres via DATABASE_URL</li>
          <li>Auth: BetterAuth at /api/auth/*</li>
          <li>Storage: Cloudflare R2 (see lib/r2.ts)</li>
          <li>No Supabase, no Vercel</li>
        </ul>
      </div>

      <QuestionCard title="What is wrong today?">
        <AnswerButton>Tap answers go here (Phase 4)</AnswerButton>
      </QuestionCard>

      <nav className="mc-row" aria-label="Account">
        <a className="mc-btn" href="/check">Start a check</a>
        <a className="mc-btn mc-btn-quiet" href="/queue">The line</a>
        <a className="mc-btn mc-btn-quiet" href="/timeline">Timeline</a>
        <a className="mc-btn mc-btn-quiet" href="/visits">Visits</a>
        <a className="mc-btn mc-btn-quiet" href="/doctor">Doctor</a>
        <a className="mc-btn mc-btn-quiet" href="/share">Share</a>
        <a className="mc-btn mc-btn-quiet" href="/signup">Create account</a>
        <a className="mc-btn mc-btn-quiet" href="/login">Sign in</a>
        <a className="mc-btn mc-btn-quiet" href="/privacy">Privacy</a>
        <a className="mc-btn mc-btn-quiet" href="/access">Access record</a>
        <a className="mc-btn mc-btn-quiet" href="/design">Design system</a>
      </nav>
    </main>
  );
}
