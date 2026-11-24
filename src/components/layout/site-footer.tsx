import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            One portal for admissions-to-results: courses, enrollment, tuition and grading.
          </p>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-sm font-semibold">Explore</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/courses">Course catalog</Link></li>
            <li><Link className="hover:text-foreground" href="/about">About the portal</Link></li>
            <li><Link className="hover:text-foreground" href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-sm font-semibold">Portal</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/login">Sign in</Link></li>
            <li><Link className="hover:text-foreground" href="/register">Create student account</Link></li>
            <li><Link className="hover:text-foreground" href="/contact">Contact support</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME}. Payments run in Stripe test mode.
      </div>
    </footer>
  );
}
