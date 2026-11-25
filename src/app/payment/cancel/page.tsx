import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { verifyCheckout } from "@/lib/api/payment-verify";
import { first, type SearchParams } from "@/lib/paginate";

export const metadata: Metadata = { title: "Payment cancelled", robots: { index: false } };

export default async function PaymentCancelPage({ searchParams }: { searchParams: SearchParams }) {
  const { session_id } = await searchParams;
  await verifyCheckout("cancel", first(session_id)); // records the cancelled attempt in the backend

  return (
    <Card className="space-y-5 p-8 text-center" role="status">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
        <XCircle className="size-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Payment cancelled</h1>
        <p className="text-sm text-muted-foreground">You were not charged. Your seat stays reserved as pending, so you can pay whenever you are ready.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/student">Back to my enrollments</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    </Card>
  );
}
