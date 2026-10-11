// Lock-screen-safe notifications: never any health details (PRD 8).
// Real push (SMS/Web Push) plugs in here later; polling + in-app banners now.

export function safeReadyPayload() {
  return { title: "Your doctor is ready", body: "Open MedConz to join.", phi: false as const };
}

export function safeReminderPayload() {
  return { title: "Your doctor is still waiting", body: "Open MedConz to join.", phi: false as const };
}
