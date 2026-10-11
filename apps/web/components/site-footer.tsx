"use client";

import { CONTACT, LEGAL, SOCIALS, type SocialKey } from "@/lib/site";

function SocialIcon({ k }: { k: SocialKey }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true,
  } as const;
  switch (k) {
    case "x":
      return (
        <svg {...common}><path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.3L1.5 2h6.4l4.4 5.9L18.9 2zm-1.1 18h1.7L7 3.9H5.2L17.8 20z" /></svg>
      );
    case "linkedin":
      return (
        <svg {...common}><path d="M20.4 20.4h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.3v1.6h.1c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.2 2.4 4.2 5.4v6.3zM5.3 7.4a2 2 0 1 1 0-4.1 2 2 0 0 1 0 4.1zM7.1 20.4H3.6V9h3.5v11.4z" /></svg>
      );
    case "tiktok":
      return (
        <svg {...common}><path d="M16.6 3c.4 2.1 1.8 3.6 4 3.9v3.1c-1.5 0-2.9-.5-4-1.3v6.4c0 3.4-2.6 6-6 6-3.3 0-6-2.6-6-6s2.7-6 6-6c.3 0 .7 0 1 .1v3.2c-.3-.1-.7-.2-1-.2-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9c1.7 0 2.9-1.3 2.9-3V3h3.1z" /></svg>
      );
    case "instagram":
      return (
        <svg {...common}><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 3.6a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.5a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z" /></svg>
      );
    default:
      // KingsChat / KingsSpace monograms until brand art exists.
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor">
            {k === "kingschat" ? "KC" : "KS"}
          </text>
        </svg>
      );
  }
}

export function SiteFooter() {
  const socials = SOCIALS.filter((s) => s.href);
  const contactHref = CONTACT.email ? `mailto:${CONTACT.email}` : CONTACT.phone ? `tel:${CONTACT.phone.replace(/\s/g, "")}` : "";
  return (
    <footer className="mc-footer">
      <div className="mc-footer-grid">
        <div>
          <strong>MedConz</strong>
          <p className="mc-muted">Doctors & dentists, online.</p>
        </div>
        <div>
          <strong>Contact Us</strong>
          {contactHref ? (
            <p><a className="mc-link" href={contactHref}>{CONTACT.email || CONTACT.phone}</a></p>
          ) : (
            <p className="mc-muted">Contact details coming soon.</p>
          )}
          {socials.length > 0 ? (
            <div className="mc-row" aria-label="Social media">
              {socials.map((s) => (
                <a key={s.key} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="mc-social">
                  <SocialIcon k={s.key} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <strong>Legal</strong>
          <div className="mc-row">
            {LEGAL.map((l) =>
              l.href ? (
                <a key={l.key} className="mc-link" href={l.href}>{l.label}</a>
              ) : (
                <span key={l.key} className="mc-link mc-link-off" aria-disabled="true" title="Coming soon">
                  {l.label}
                </span>
              ),
            )}
          </div>
          <p className="mc-muted">Full documents coming soon.</p>
        </div>
      </div>
    </footer>
  );
}
