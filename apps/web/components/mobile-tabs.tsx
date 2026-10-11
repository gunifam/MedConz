"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "./brand";

const TABS = [
  { href: "/check", label: "Check" },
  { href: "/queue", label: "Queue" },
  { href: "/timeline", label: "Timeline" },
  { href: "/visits", label: "Visits" },
] as const;

function isActive(path: string, href: string): boolean {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href + "/");
}

/**
 * Bottom tabs, signed-in users only. Guests see no tabs — account areas
 * (queue, timeline, visits) unlock after sign in. Home is the MedConz icon.
 */
export function MobileTabs() {
  const path = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/get-session")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAuthed(!!d?.user))
      .catch(() => setAuthed(false));
  }, [path]);

  if (!authed) return null;

  return (
    <nav className="mc-tabs" aria-label="Main">
      <Link
        href="/"
        className="mc-tab"
        aria-label="Home"
        aria-current={path === "/" ? "page" : undefined}
      >
        <BrandMark size={26} />
      </Link>
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
    </nav>
  );
}
