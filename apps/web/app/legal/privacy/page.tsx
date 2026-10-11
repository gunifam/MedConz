import { InfoBanner } from "@medconz/ui";

// Short plain-words summary of how MedConz handles data. The full legal
// document is pending legal review — this page says what the app DOES today.
export default function PrivacyPolicyPage() {
  return (
    <main>
      <h1>Privacy policy</h1>
      <InfoBanner>Plain-words summary. The full legal document is being reviewed and will appear here.</InfoBanner>
      <section className="mc-card">
        <h2>What we keep</h2>
        <p>Your account details, symptom-check answers, visit summaries, payments records, and sharing settings — only what care needs.</p>
      </section>
      <section className="mc-card">
        <h2>Who sees it</h2>
        <ul>
          <li>You, the doctor or dentist you consult, and future doctors you consult.</li>
          <li>Payment details are never shown to doctors.</li>
          <li>Every time a doctor opens your record, it is written to your access record, which you can see and report.</li>
        </ul>
      </section>
      <section className="mc-card">
        <h2>Your control</h2>
        <ul>
          <li>Delete any entry any time — it leaves every screen at once and is erased for good after 6 months.</li>
          <li>Withdraw consent on the privacy page.</li>
          <li>Share only what you choose, with expiring links you can cancel in one tap.</li>
        </ul>
      </section>
      <section className="mc-card">
        <h2>What we never do</h2>
        <p>We never sell health information, never show it to advertisers, and never let payment buy priority in the queue.</p>
      </section>
    </main>
  );
}
