"use client";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";
import type { PageMeta } from "@/types";

export function Pagination({ meta }: { meta: PageMeta }) {
  const { hrefFor } = useUrlState();
  if (meta.total === 0) return null;
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  const prevDisabled = meta.page <= 1;
  const nextDisabled = meta.page >= meta.totalPages;

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        {from}–{to} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={hrefFor("page", String(meta.page - 1))}
          aria-disabled={prevDisabled}
          tabIndex={prevDisabled ? -1 : undefined}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), prevDisabled && "pointer-events-none opacity-50")}
        >
          <ChevronLeft /> Prev
        </Link>
        <span className="tabular-nums text-muted-foreground">
          {meta.page} / {Math.max(meta.totalPages, 1)}
        </span>
        <Link
          href={hrefFor("page", String(meta.page + 1))}
          aria-disabled={nextDisabled}
          tabIndex={nextDisabled ? -1 : undefined}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), nextDisabled && "pointer-events-none opacity-50")}
        >
          Next <ChevronRight />
        </Link>
      </div>
    </nav>
  );
}
