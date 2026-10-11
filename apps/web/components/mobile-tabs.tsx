"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { clearLocalDrafts } from "@/lib/checks/drafts";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/check", label: "Check" },
  { href: "/queue", label: "Queue" },
  { href: "/timeline", label: "Timeline" },
  { href: "/visits", label: "Visits" },
] as const;

function isActive(path: string, href: string): boolean {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href + "/");
}

/** Permanent bottom tab bar — on every page, always a way back home. */
export function MobileTabs() {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    clearLocalDrafts(); // shared-phone safety: drafts never survive logout
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <nav className="mc-tabs" aria-label="Main">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className="mc-tab"
          aria-current={isActive(path, t.href) ? "page" : undefined}
        >
          {t.label}
        </Link>
      ))}
      <button type="button" className="mc-tab" onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
