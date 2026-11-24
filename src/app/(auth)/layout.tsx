import { GraduationCap } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <Logo light className="relative" />
        <div className="relative space-y-4">
          <GraduationCap className="size-10 text-accent" />
          <p className="max-w-md font-serif text-3xl leading-snug">
            “From the first enrollment to the final grade — everything in one place.”
          </p>
          <p className="text-sm text-sidebar-muted">Students · Faculty · Administrators</p>
        </div>
        <p className="relative text-xs text-sidebar-muted">Payments run in Stripe test mode.</p>
      </aside>
      <main id="main" className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
