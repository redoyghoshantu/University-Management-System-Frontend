import { Logo } from "@/components/shared/logo";

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-secondary/40 px-4 py-10">
      <Logo />
      <main id="main" className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
