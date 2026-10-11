"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm({ role, next }: { role: string | null; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const clinical = role === "doctor" || role === "dentist";
  const signupHref = clinical
    ? `/signup?role=${role}&locked=${role}&next=${encodeURIComponent(next)}`
    : `/signup?next=${encodeURIComponent(next)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await authClient.signIn.email({ email, password });
    if (res.error) {
      setError(res.error.message ?? "Could not sign you in.");
      return;
    }
    router.push(next);
  }

  return (
    <main>
      <h1>{clinical ? `Welcome back, doctor${role === "dentist" ? " (dentist)" : ""}` : "Welcome back"}</h1>
      {clinical ? (
        <p className="mc-muted">Signing in to the doctor line. New here? Use the sign-up button below.</p>
      ) : null}
      <form onSubmit={submit} className="mc-card">
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
          <input className="mc-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <br />
        <button type="submit" className="mc-btn mc-btn-primary">
          Sign in
        </button>
      </form>
      <p>
        <a className="mc-link" href="/forgot-password">Forgot password?</a>
      </p>
      <p>
        No account yet?{" "}
        <a className="mc-link" href={signupHref}>
          {clinical ? `Sign up as a ${role}` : "Sign up"}
        </a>
        .
      </p>
    </main>
  );
}
