import { DoctorStart } from "./doctor-start";

function cleanNext(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.startsWith("/") && !s.startsWith("//") ? s : "/doctor";
}

export default function DoctorStartPage({
  searchParams,
}: {
  searchParams: { next?: string | string[] };
}) {
  return <DoctorStart next={cleanNext(searchParams.next)} />;
}
