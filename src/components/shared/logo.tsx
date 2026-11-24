import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

export function Logo({ className, href = "/", light }: { className?: string; href?: string; light?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 font-serif text-lg font-semibold", className)}>
      <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
        <GraduationCap className="size-5" />
      </span>
      <span className={light ? "text-sidebar-foreground" : undefined}>{SITE_NAME}</span>
    </Link>
  );
}
