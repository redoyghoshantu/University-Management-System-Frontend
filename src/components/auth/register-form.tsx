"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";

// Mirrors the backend rules: name >= 2 chars, valid email, password >= 6 chars.
const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type Values = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched" });

  async function onSubmit({ name, email, password }: Values) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const json = (await res.json().catch(() => null)) as { message?: string; data?: { role: string | null } } | null;
    if (!res.ok) {
      toast.error(json?.message ?? "Registration failed");
      return;
    }
    toast.success(json?.message ?? "Account created");
    router.replace(json?.data?.role ? "/student" : "/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">Student accounts only — faculty and admins are assigned by an administrator.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
          </Field>
          <Field label="Confirm password" htmlFor="confirm" error={errors.confirm?.message}>
            <Input id="confirm" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register("confirm")} />
          </Field>
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
        {isSubmitting && <p role="status" className="text-center text-xs text-muted-foreground">The free-tier API may take up to a minute to wake up.</p>}
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
