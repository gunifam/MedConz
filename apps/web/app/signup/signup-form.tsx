"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsentCheckbox } from "@medconz/ui";
import { authClient } from "@/lib/auth-client";

export function SignupForm({ initialRole, locked, next }: { initialRole: string; locked: string | null; next: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!consent) {
      setError("Please agree to the privacy promise first.");
      return;
    }
    // Local dev: clinical roles are self-selected. In production MedConz
    // authorizes every doctor/dentist before they can consult (PRD 11.2).
    const specialty = role === "dentist" ? "dentist" : role === "doctor" ? "doctor" : undefined;
    const res = await authClient.signUp.email({ name, email, password, role, specialty });
    if (res.error) {
      setError(res.error.message ?? "Could not create your account.");
      return;
    }
    await fetch("/api/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    router.push(next);
  }

  return (
    <main>
      <h1>Sign up{role === "doctor" ? " as a doctor" : role === "dentist" ? " as a dentist" : ""}</h1>
      <form onSubmit={submit} className="mc-card">
        <label>
          Your name
          <br />
          <input className="mc-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <br />
        <br />
        <label>
          Email
          <br />
          <input className="mc-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <br />
        <label>
          Password
          <br />
          <input className="mc-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </label>
        <br />
        <br />
        {locked ? null : (
          <>
            <div className="mc-row" role="radiogroup" aria-label="I am signing up as">
              {(["patient", "doctor", "dentist"] as const).map((r) => (
                <button key={r} type="button" className="mc-chip" aria-pressed={role === r} onClick={() => setRole(r)}>
                  {r === "patient" ? "Patient" : r === "doctor" ? "Doctor" : "Dentist"}
                </button>
              ))}
            </div>
            <br />
          </>
        )}
        <ConsentCheckbox
          checked={consent}
          onChange={setConsent}
          label={
            <span>
              I agree with{" "}
              <a className="mc-link" href="/legal/privacy">privacy policy</a> and{" "}
              <a className="mc-link" href="/legal/terms">terms of service</a> of MedConz.
            </span>
          }
        />
        {error ? <p role="alert">{error}</p> : null}
        <br />
        <button type="submit" className="mc-btn mc-btn-primary">
          Sign up
        </button>
      </form>
      <p>
        Have an account?{" "}
        <a
          className="mc-link"
          href={locked ? `/login?role=${locked}&next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`}
        >
          Sign in
        </a>
        .
      </p>
    </main>
  );
}
