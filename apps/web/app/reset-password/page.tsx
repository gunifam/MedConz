"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("This link is missing its token. Ask for a new one.");
      return;
    }
    const res = await authClient.resetPassword({ newPassword: password, token });
    if (res.error) {
      setError(res.error.message ?? "Link expired or invalid. Ask for a new one.");
      return;
    }
    router.push("/login");
  }

  return (
    <main>
      <h1>Set a new password</h1>
      <form onSubmit={submit} className="mc-card">
        <label>
          New password
          <br />
          <input className="mc-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <br />
        <button type="submit" className="mc-btn mc-btn-primary">
          Save new password
        </button>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
