import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { PaymentHistory } from "./history-client";

export default async function PaymentHistoryPage({
  searchParams,
}: {
  searchParams: { show?: string | string[] };
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?next=/payments/history");
  const show = Array.isArray(searchParams.show) ? searchParams.show[0] : searchParams.show;
  return <PaymentHistory refundsOnly={show === "refunds"} />;
}
