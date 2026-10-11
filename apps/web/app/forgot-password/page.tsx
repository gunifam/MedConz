"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const res = await authClient.requestPasswordReset({
      email,
      redirectTo: `${appUrl}/reset-password`,
    });
    if (res.error) {
      setError(res.error.message ?? "Could not send the link.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <main>
        <h1>Check your email</h1>
        <section className="mc-card">
          <p>If an account uses {email}, a reset link is on its way. It works for 1 hour.</p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <h1>Forgot password</h1>
      <form onSubmit={submit} className="mc-card">
        <label>
          Email
          <br />
          <input className="mc-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <br />
        <button type="submit" className="mc-btn mc-btn-primary">
          Send reset link
        </button>
      </form>
    </main>
  );
}
