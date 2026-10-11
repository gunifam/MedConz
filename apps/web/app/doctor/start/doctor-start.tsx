export function DoctorStart({ next }: { next: string }) {
  return (
    <main>
      <section className="mc-hero">
        <h1>Doctors & dentists</h1>
        <p>Take consultations, review symptom checks, and get paid for your time. MedConz authorizes every clinician before they consult.</p>
      </section>
      <section className="mc-card">
        <h2>Already with MedConz?</h2>
        <a className="mc-btn mc-btn-primary" href={`/login?role=doctor&next=${encodeURIComponent(next)}`}>
          Doctor sign in
        </a>
      </section>
      <section className="mc-card">
        <h2>New here?</h2>
        <div className="mc-row">
          <a className="mc-btn" href={`/signup?role=doctor&locked=doctor&next=${encodeURIComponent(next)}`}>
            Sign up as a doctor
          </a>
          <a className="mc-btn mc-btn-quiet" href={`/signup?role=dentist&locked=dentist&next=${encodeURIComponent(next)}`}>
            Sign up as a dentist
          </a>
        </div>
      </section>
    </main>
  );
}
