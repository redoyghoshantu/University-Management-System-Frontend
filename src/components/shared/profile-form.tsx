"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { formatDate, initials } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types";

const schema = z.object({ name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name is too long") });
type Values = z.infer<typeof schema>;

export function ProfileForm({ user }: { user: User }) {
  const setUser = useAuthStore((s) => s.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { name: user.name } });

  const save = useApiMutation((v: Values) => api<User>("/auth/me", { method: "PATCH", body: v }), {
    success: "Profile updated",
    onSuccess: (updated) => setUser(updated),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 pt-8 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-primary font-serif text-2xl font-semibold text-primary-foreground">{initials(user.name)}</span>
          <div>
            <p className="font-serif text-xl font-semibold">{user.name}</p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" /> {user.email}
            </p>
          </div>
          <StatusBadge status={user.role} />
          {user.createdAt && <p className="text-xs text-muted-foreground">Member since {formatDate(user.createdAt)}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>Your email and role are managed by the university.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4" noValidate>
            <Field label="Full name" htmlFor="p-name" error={errors.name?.message}>
              <Input id="p-name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
            </Field>
            <Field label="Email" htmlFor="p-email" hint="Contact the registrar to change your email.">
              <Input id="p-email" value={user.email} disabled readOnly />
            </Field>
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" /> Changes are recorded securely.
              </p>
              <Button type="submit" loading={save.isPending} disabled={!isDirty}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
