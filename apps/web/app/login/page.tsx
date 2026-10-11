import { LoginForm } from "./login-form";

function cleanRole(v: string | string[] | undefined): string | null {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "doctor" || s === "dentist" ? s : null;
}

function cleanNext(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.startsWith("/") && !s.startsWith("//") ? s : "/privacy";
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { role?: string | string[]; next?: string | string[] };
}) {
  return <LoginForm role={cleanRole(searchParams.role)} next={cleanNext(searchParams.next)} />;
}
