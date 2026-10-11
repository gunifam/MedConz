// Public footer links in ONE place. Empty href = hidden (socials) or
// shown-disabled (legal/contact) until the real links/pages exist.

export const CONTACT = {
  email: "",
  phone: "",
};

export type SocialKey = "kingschat" | "kingschat-space" | "x" | "linkedin" | "tiktok" | "instagram";

export const SOCIALS: { key: SocialKey; label: string; href: string }[] = [
  { key: "kingschat", label: "KingsChat", href: "" },
  { key: "kingschat-space", label: "KingsSpace", href: "" },
  { key: "x", label: "X", href: "" },
  { key: "linkedin", label: "LinkedIn", href: "" },
  { key: "tiktok", label: "TikTok", href: "" },
  { key: "instagram", label: "Instagram", href: "" },
];

export const LEGAL: { key: string; label: string; href: string }[] = [
  { key: "privacy", label: "Privacy policy", href: "" },
  { key: "terms", label: "Terms of Use", href: "" },
  { key: "ndpr", label: "NDPR", href: "" },
];
