import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { verifyCheckout } from "@/lib/api/payment-verify";
import { first, type SearchParams } from "@/lib/paginate";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Payment result", robots: { index: false } };

export default async function PaymentSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { session_id } = await searchParams;
  const result = await verifyCheckout("success", first(session_id));
  const paid = result.ok && result.payment?.status === "PAID";
  const pending = result.ok && !paid;

  const Icon = paid ? CheckCircle2 : pending ? Clock : TriangleAlert;
  const tone = paid ? "bg-success/15 text-success" : pending ? "bg-warning/20 text-accent-foreground" : "bg-destructive/10 text-destructive";

  return (
    <Card className="space-y-5 p-8 text-center" role="status">
      <div className={`mx-auto grid size-16 place-items-center rounded-full ${tone}`}>
        <Icon className="size-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{paid ? "Payment successful" : pending ? "Payment is processing" : "We couldn't confirm this payment"}</h1>
        <p className="text-sm text-muted-foreground">
          {paid ? "Your seat is confirmed. A receipt is available in your payment history." : pending ? "Stripe hasn't confirmed the charge yet. Refresh this page in a moment." : result.message}
        </p>
      </div>
      {result.payment && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg bg-muted p-4 text-left text-sm">
          <dt className="text-muted-foreground">Amount</dt>
          <dd className="font-medium tabular-nums">{formatMoney(Number(result.payment.amount))}</dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-medium">{result.payment.status}</dd>
          <dt className="text-muted-foreground">Reference</dt>
          <dd className="truncate font-mono text-xs">{result.payment.id}</dd>
        </dl>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/student">My enrollments</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/student/payments">Payment history</Link>
        </Button>
      </div>
    </Card>
  );
}
