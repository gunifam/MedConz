"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { clearLocalDrafts } from "@/lib/checks/drafts";

type User = { name?: string | null; email?: string | null; role?: string | null };

// Top-right profile. Rendered ONLY when signed in; guests see nothing.
export function ProfileMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/get-session")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  if (!user) return null;

  async function logout() {
    clearLocalDrafts();
    await authClient.signOut();
    router.push("/login");
  }

  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="mc-profile-wrap">
      <button
        type="button"
        className="mc-profile-btn"
        aria-label="Your profile"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {initial}
      </button>
      {open ? (
        <div className="mc-profile-panel" role="menu">
          <div className="mc-name">
            <strong>{user.name ?? "Patient"}</strong>
            <div className="mc-muted">{user.email ?? ""}{user.role && user.role !== "patient" ? ` · ${user.role}` : ""}</div>
          </div>
          <a href="/profile/edit" onClick={() => setOpen(false)}>Edit profile</a>
          <a href="/payments/history" onClick={() => setOpen(false)}>Payment history</a>
          <a href="/payments/history?show=refunds" onClick={() => setOpen(false)}>Refund history</a>
          <a href="/share" onClick={() => setOpen(false)}>Share</a>
          <a href="/privacy" onClick={() => setOpen(false)}>Privacy</a>
          <a href="/access" onClick={() => setOpen(false)}>Access record</a>
          <button type="button" className="mc-logout" onClick={logout}>
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
