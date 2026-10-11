"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await authClient.signIn.email({ email, password });
    if (res.error) {
      setError(res.error.message ?? "Could not sign you in.");
      return;
    }
    router.push("/privacy");
  }

  return (
    <main>
      <h1>Welcome back</h1>
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
        No account yet? <a className="mc-link" href="/signup">Create one</a>.
      </p>
    </main>
  );
}
