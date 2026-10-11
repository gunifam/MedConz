import { InfoBanner } from "@medconz/ui";

// Short plain-words terms. The full legal document is pending legal review.
export default function TermsPage() {
  return (
    <main>
      <h1>Terms of service</h1>
      <InfoBanner>Plain-words summary. The full legal document is being reviewed and will appear here.</InfoBanner>
      <section className="mc-card">
        <h2>What MedConz is</h2>
        <p>An online consultation platform. Symptom checks prepare you and the doctor — they never diagnose. Only a doctor or dentist diagnoses and treats.</p>
      </section>
      <section className="mc-card">
        <h2>Emergencies</h2>
        <p>If anything sounds serious, we show emergency numbers first and always free. In an emergency, call for help and go to a hospital — do not wait in line.</p>
      </section>
      <section className="mc-card">
        <h2>Payments</h2>
        <ul>
          <li>Prices are shown before you pay. No hidden charges.</li>
          <li>Payment never buys a faster place in line.</li>
          <li>Automatic refunds when no doctor sees you through no fault of yours; missed turns keep answers and payment.</li>
        </ul>
      </section>
      <section className="mc-card">
        <h2>Fair use</h2>
        <ul>
          <li>Answer honestly — it is how doctors help you safely.</li>
          <li>One account per person; caregivers fill only with proper approval.</li>
          <li>Misuse (false reports, abuse of doctors, payment fraud) can limit access, with a reason and a way to appeal. Emergency information is never limited.</li>
        </ul>
      </section>
    </main>
  );
}
