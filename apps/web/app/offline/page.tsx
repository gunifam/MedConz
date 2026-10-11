import { EmergencyBanner } from "@medconz/ui";

// Fully static: prerendered, so the service worker can serve it offline.
// Emergency info is never behind login, payment, or connection (PRD 5.5).
export default function OfflinePage() {
  return (
    <main>
      <h1>You are offline</h1>
      <EmergencyBanner title="If this is an emergency, get help now.">
        <div>National emergency: <a href="tel:112">112</a></div>
        <div>Lagos emergency: <a href="tel:767">767</a></div>
        <div>Go to the nearest hospital now. Show them this warning on your phone.</div>
      </EmergencyBanner>
      <section className="mc-card">
        <p>MedConz needs a connection for check-ins, queues and visits. Your saved answers stay on this phone.</p>
        <p>Reconnect, then continue where you stopped.</p>
      </section>
    </main>
  );
}
