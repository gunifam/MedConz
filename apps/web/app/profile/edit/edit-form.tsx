"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EditProfileForm({ initialName, initialLang }: { initialName: string; initialLang: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [lang, setLang] = useState(initialLang);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, preferredLanguage: lang }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error ?? "Could not save.");
      return;
    }
    setMsg("Saved.");
    router.refresh();
  }

  return (
    <main>
      <h1>Edit profile</h1>
      <form onSubmit={save} className="mc-card">
        <label>
          Your name
          <br />
          <input className="mc-input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        </label>
        <br />
        <br />
        <label>
          Language
          <br />
          <select className="mc-select" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Preferred language">
            <option value="en">English</option>
            <option value="ha">Hausa</option>
            <option value="yo">Yoruba</option>
            <option value="ig">Igbo</option>
          </select>
        </label>
        <br />
        <br />
        <button type="submit" className="mc-btn mc-btn-primary" disabled={busy}>
          Save
        </button>
      </form>
      {msg ? <p aria-live="polite">{msg}</p> : null}
    </main>
  );
}
