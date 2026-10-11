import { SignupForm } from "./signup-form";

function cleanRole(v: string | string[] | undefined): string | null {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "doctor" || s === "dentist" ? s : null;
}

function cleanNext(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.startsWith("/") && !s.startsWith("//") ? s : "/privacy";
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: { role?: string | string[]; locked?: string | string[]; next?: string | string[] };
}) {
  const locked = cleanRole(searchParams.locked);
  const initialRole = locked ?? cleanRole(searchParams.role) ?? "patient";
  return <SignupForm initialRole={initialRole} locked={locked} next={cleanNext(searchParams.next)} />;
}
