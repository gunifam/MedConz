"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Runner } from "../[id]/runner";
import { loadGuest, type GuestCheck } from "@/lib/checks/drafts";

// Guest flow (no account): runs entirely on this phone. Sending needs an
// account — the review screen says so and routes to sign up.
export default function GuestCheckPage() {
  const router = useRouter();
  const [guest, setGuest] = useState<GuestCheck | null | undefined>(undefined);

  useEffect(() => {
    setGuest(loadGuest());
  }, []);

  useEffect(() => {
    if (guest === null) router.replace("/check");
  }, [guest, router]);

  if (!guest) return <main><p>Loading your check…</p></main>;
  if (!guest.complaint) {
    router.replace("/check");
    return null;
  }
  return (
    <Runner
      checkId="guest"
      complaint={guest.complaint}
      language={guest.language || "en"}
      initialAnswers={{ caregiver: guest.caregiver, ...guest.answers }}
      guest
    />
  );
}
