"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { DemoLogin } from "@/components/auth/demo-login";
import { ROLE_HOME } from "@/lib/constants";
import type { Role } from "@/types";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched" });

  const busy = isSubmitting || pendingRole !== null;

  async function signIn(values: Values) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = (await res.json().catch(() => null)) as { message?: string; data?: { role?: Role } } | null;
    if (!res.ok || !json?.data?.role) {
      toast.error(json?.message ?? "Login failed");
      return false;
    }
    const role = json.data.role;
    const next = params.get("next");
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    toast.success("Welcome back!");
    router.replace(safeNext ?? ROLE_HOME[role]);
    router.refresh();
    return true;
  }

  async function demo(account: { role: Role; email: string; password: string }) {
    setPendingRole(account.role);
    const ok = await signIn({ email: account.email, password: account.password });
    if (!ok) setPendingRole(null);
  }

  const reason = params.get("reason");

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-semibold">Welcome back 👋</h1>
        <p className="text-sm text-muted-foreground">Login to your account</p>
        {reason === "expired" && <p className="text-xs text-warning">Your session expired — please sign in again.</p>}
      </div>

      <form onSubmit={handleSubmit(signIn)} className="grid gap-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@university.edu" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
        </Field>
        <Button type="submit" loading={isSubmitting} disabled={busy} className="w-full">
          Login
        </Button>
      </form>

      {busy && (
        <p role="status" className="rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          Signing in… the free-tier API can take up to a minute to wake up on the first request.
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
      </div>

      <DemoLogin onLogin={demo} pendingRole={pendingRole} disabled={busy} />

      <p className="text-center text-sm text-muted-foreground">
        New student?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
