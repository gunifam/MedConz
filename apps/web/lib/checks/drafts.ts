// Offline draft mirror. Server is the source of truth; this keeps answers
// safe on weak connections and makes resume instant. Namespaced per user,
// cleared on logout. (Client-only.)

export type LocalDraft = {
  id: string;
  complaint: string;
  answers: Record<string, unknown>;
  updatedAt: string;
};

const key = (ns: string) => `medconz:draft:${ns}`;

export function saveLocalDraft(ns: string, draft: LocalDraft) {
  try {
    localStorage.setItem(key(ns), JSON.stringify(draft));
  } catch {
    /* storage full or private mode — server autosave still applies */
  }
}

export function loadLocalDraft(ns: string): LocalDraft | null {
  try {
    const raw = localStorage.getItem(key(ns));
    return raw ? (JSON.parse(raw) as LocalDraft) : null;
  } catch {
    return null;
  }
}

export function clearLocalDrafts() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith("medconz:draft:")) localStorage.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}

// Guest check (no account yet): the whole draft lives on this phone until
// sign in/up, then /check/finish moves it to the server.
export type GuestCheck = {
  complaint: string;
  language: string;
  caregiver: Record<string, unknown>;
  answers: Record<string, unknown>;
  updatedAt: string;
};

const GUEST_KEY = "medconz:guest-check";

export function saveGuest(g: GuestCheck) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(g));
  } catch {
    /* ignore */
  }
}

export function loadGuest(): GuestCheck | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as GuestCheck) : null;
  } catch {
    return null;
  }
}

export function clearGuest() {
  try {
    localStorage.removeItem(GUEST_KEY);
  } catch {
    /* ignore */
  }
}
