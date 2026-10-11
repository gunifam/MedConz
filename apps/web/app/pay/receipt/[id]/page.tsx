import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, eq, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { payments } from "@medconz/db";
import { ReceiptCard } from "@medconz/ui";
import { RefundButton } from "./refund-button";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  const rows = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.id, params.id),
        or(eq(payments.patientId, session.user.id), eq(payments.paidById, session.user.id)),
      ),
    )
    .limit(1);
  const p = rows[0];
  if (!p) redirect("/check");

  return (
    <main>
      <h1>Payment {p.status}</h1>
      <ReceiptCard
        amount={p.quotedAmount}
        currency={p.currency}
        ngnValue={String(p.amountNgn)}
        date={new Date(p.createdAt).toLocaleString()}
        receiptId={p.id.slice(0, 8).toUpperCase()}
        status={p.status === "paid" ? "Paid" : p.status === "pending" ? "Waiting for payment" : p.status === "refunded" ? "Refunded" : "Failed"}
      />
      {p.status === "paid" ? (
        <>
          <section className="mc-card">
            <p>You are in line for a doctor. Your place and answers are kept.</p>
            <a className="mc-btn mc-btn-primary" href="/queue">See the line</a>
          </section>
          <RefundButton paymentId={p.id} />
        </>
      ) : null}
    </main>
  );
}
