"use client";
import { Briefcase, GraduationCap, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import type { Role } from "@/types";

const ICONS: Record<Role, LucideIcon> = { ADMIN: ShieldCheck, FACULTY: Briefcase, STUDENT: GraduationCap };

export function DemoLogin({
  onLogin,
  pendingRole,
  disabled,
}: {
  onLogin: (account: (typeof DEMO_ACCOUNTS)[number]) => void;
  pendingRole: Role | null;
  disabled: boolean;
}) {
  return (
    <section aria-labelledby="demo-title" className="space-y-3">
      <h2 id="demo-title" className="text-center font-sans text-sm font-semibold">
        🚀 Quick demo login
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((a) => {
          const Icon = ICONS[a.role];
          return (
            <Card key={a.role} className="flex flex-col items-center gap-2 p-3 text-center">
              <Icon className="size-6 text-primary" />
              <p className="text-sm font-semibold">{a.label}</p>
              <p className="hidden text-[11px] leading-tight text-muted-foreground sm:block">{a.blurb}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-auto w-full"
                disabled={disabled}
                loading={pendingRole === a.role}
                onClick={() => onLogin(a)}
              >
                Demo login
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
