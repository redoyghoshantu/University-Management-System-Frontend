"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, CreditCard, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/lib/api/client";
import { FEE_PER_CREDIT } from "@/lib/constants";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { useEnrollWizard } from "@/store/enroll-wizard-store";
import type { Offering, Paginated, Semester } from "@/types";

const STEPS = ["Semester", "Course", "Review"];

export function EnrollWizard({ semesters, enrolledOfferingIds }: { semesters: Semester[]; enrolledOfferingIds: string[] }) {
  const router = useRouter();
  const { step, semesterId, offeringId, setStep, setSemester, setOffering, reset } = useEnrollWizard();
  const [ready, setReady] = useState(false);

  // Wizard progress lives in sessionStorage; rehydrate after mount to avoid SSR mismatches.
  useEffect(() => {
    void Promise.resolve(useEnrollWizard.persist.rehydrate()).then(() => setReady(true));
  }, []);

  const offerings = useQuery({
    queryKey: ["offerings", semesterId],
    queryFn: () => api<Paginated<Offering>>("/course-offerings", { query: { semesterId, limit: 50 } }),
    enabled: ready && !!semesterId,
  });

  const selected = offerings.data?.data.find((o) => o.id === offeringId);
  const semester = semesters.find((s) => s.id === semesterId);

  const enroll = useMutation({
    mutationFn: async (payNow: boolean) => {
      const enrollment = await api<{ id: string }>("/enrollments", { method: "POST", body: { offeringId } });
      if (!payNow) return null;
      return api<{ checkoutUrl: string }>("/payments/initiate", { method: "POST", body: { enrollmentId: enrollment.id } });
    },
    onSuccess: (checkout) => {
      reset();
      if (checkout) {
        toast.message("Seat reserved — redirecting to Stripe…");
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      toast.success("Seat reserved. Complete payment from My enrollments to confirm it.");
      router.push("/student");
      router.refresh();
    },
  });

  if (!ready) return <Skeleton className="h-96 rounded-xl" />;

  const canNext = step === 0 ? !!semesterId : step === 1 ? !!offeringId : false;

  return (
    <div className="space-y-6">
      <ol className="flex items-center gap-2" aria-label="Enrollment progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={i === step ? "step" : undefined}
              className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold", i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={cn("text-sm", i === step ? "font-medium" : "text-muted-foreground")}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-3 text-sm text-muted-foreground">Which semester are you enrolling for?</legend>
          {semesters.length === 0 && <Card className="sm:col-span-2"><EmptyState title="No semesters available" description="An administrator needs to create a semester first." /></Card>}
          {semesters.map((s) => (
            <label key={s.id} className={cn("cursor-pointer rounded-xl border bg-card p-4 transition-colors has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/20 hover:bg-secondary/50")}>
              <input type="radio" name="semester" className="sr-only" checked={semesterId === s.id} onChange={() => setSemester(s.id)} />
              <span className="flex items-center justify-between gap-2">
                <span className="font-serif text-lg font-semibold">{s.name}</span>
                {s.isActive && <Badge variant="success">Open</Badge>}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {formatDate(s.startDate)} → {formatDate(s.endDate)}
              </span>
            </label>
          ))}
        </fieldset>
      )}

      {step === 1 && (
        <div className="space-y-3">
          {offerings.isPending ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : !offerings.data || offerings.data.data.length === 0 ? (
            <Card>
              <EmptyState icon={<SearchX />} title="No offerings in this semester" description="Go back and choose another semester." />
            </Card>
          ) : (
            offerings.data.data.map((o) => {
              const taken = enrolledOfferingIds.includes(o.id);
              const full = o._count.enrollments >= o.capacity;
              const disabled = taken || full;
              return (
                <label key={o.id} className={cn("flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/20", disabled ? "opacity-60" : "cursor-pointer hover:bg-secondary/50")}>
                  <input type="radio" name="offering" className="mt-1.5 accent-[var(--primary)]" disabled={disabled} checked={offeringId === o.id} onChange={() => setOffering(o.id)} />
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{o.course.title}</span>
                      <Badge variant="outline">{o.course.code}</Badge>
                      {taken && <Badge variant="secondary">Already enrolled</Badge>}
                      {!taken && full && <Badge variant="destructive">Full</Badge>}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {o.faculty.name} · {o.course.credits} credits · {o._count.enrollments}/{o.capacity} seats taken
                    </span>
                  </span>
                  <span className="font-serif text-lg font-semibold tabular-nums">{formatMoney(o.course.credits * FEE_PER_CREDIT)}</span>
                </label>
              );
            })
          )}
        </div>
      )}

      {step === 2 && selected && (
        <Card className="space-y-4 p-6">
          <h2 className="text-xl font-semibold">Review your enrollment</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Course</dt>
            <dd className="font-medium">{selected.course.code} — {selected.course.title}</dd>
            <dt className="text-muted-foreground">Semester</dt>
            <dd className="font-medium">{semester?.name}</dd>
            <dt className="text-muted-foreground">Faculty</dt>
            <dd className="font-medium">{selected.faculty.name}</dd>
            <dt className="text-muted-foreground">Credits</dt>
            <dd className="font-medium">{selected.course.credits}</dd>
            <dt className="text-muted-foreground">Tuition</dt>
            <dd className="font-serif text-xl font-semibold">{formatMoney(selected.course.credits * FEE_PER_CREDIT)}</dd>
          </dl>
          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            Your seat is held as <strong>pending</strong> until tuition is paid. Payment runs in Stripe test mode — use card 4242 4242 4242 4242.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="accent" loading={enroll.isPending && enroll.variables === true} disabled={enroll.isPending} onClick={() => enroll.mutate(true)}>
              <CreditCard /> Enroll & pay now
            </Button>
            <Button variant="outline" loading={enroll.isPending && enroll.variables === false} disabled={enroll.isPending} onClick={() => enroll.mutate(false)}>
              Reserve seat, pay later
            </Button>
          </div>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 0 || enroll.isPending} onClick={() => setStep(step - 1)}>
          <ArrowLeft /> Back
        </Button>
        {step < 2 && (
          <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
            Next <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
