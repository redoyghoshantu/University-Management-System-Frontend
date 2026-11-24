"use client";
import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ErrorView({ error, reset, home = "/" }: { error: Error & { digest?: string }; reset: () => void; home?: string }) {
  useEffect(() => {
    toast.error(error.message || "Something went wrong");
  }, [error]);

  return (
    <div role="alert" className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <TriangleAlert className="size-8" />
      </div>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred."} If the server was asleep, give it a few seconds and retry.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href={home}>Go back</Link>
        </Button>
      </div>
    </div>
  );
}
