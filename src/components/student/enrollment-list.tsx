"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookPlus, CheckCircle2, Clock, CreditCard, DollarSign, GraduationCap, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { api } from "@/lib/api/client";
import { FEE_PER_CREDIT } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import type { Enrollment } from "@/types";

const KEY = ["my-enrollments"] as const;
const fee = (e: Enrollment) => e.offering.course.credits * FEE_PER_CREDIT;

export function EnrollmentList({ initialData }: { initialData: Enrollment[] }) {
  const qc = useQueryClient();
  const router = useRouter();
  const { data = initialData } = useQuery({ queryKey: KEY, queryFn: () => api<Enrollment[]>("/enrollments/my-enrollments"), initialData });

  // Optimistic cancel: the row flips to CANCELLED instantly and rolls back if the API rejects it.
  const cancel = useMutation({
    mutationFn: (id: string) => api(`/enrollments/${id}/cancel`, { method: "PATCH" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<Enrollment[]>(KEY);
      qc.setQueryData<Enrollment[]>(KEY, (old) => old?.map((e) => (e.id === id ? { ...e, status: "CANCELLED" } : e)));
      return { previous };
    },
    onError: (_err, _id, ctx) => qc.setQueryData(KEY, ctx?.previous),
    onSuccess: () => toast.success("Enrollment cancelled"),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: KEY });
      router.refresh();
    },
  });

  const pay = useMutation({
    mutationFn: (enrollmentId: string) => api<{ checkoutUrl: string }>("/payments/initiate", { method: "POST", body: { enrollmentId } }),
    onSuccess: ({ checkoutUrl }) => {
      toast.message("Redirecting to secure Stripe checkout…");
      window.location.assign(checkoutUrl);
    },
  });

  const active = data.filter((e) => e.status !== "CANCELLED");
  const confirmed = active.filter((e) => e.status === "CONFIRMED").length;
  const due = active.filter((e) => e.paymentStatus !== "PAID").reduce((s, e) => s + fee(e), 0);
  const credits = active.filter((e) => e.status === "CONFIRMED").reduce((s, e) => s + e.offering.course.credits, 0);

  const columns: Column<Enrollment>[] = [
    {
      header: "Course",
      cell: (e) => (
        <div>
          <p className="font-medium">{e.offering.course.title}</p>
          <p className="text-xs text-muted-foreground">
            <Badge variant="outline" className="mr-1.5">{e.offering.course.code}</Badge>
            {e.offering.semester.name}
          </p>
        </div>
      ),
    },
    { header: "Faculty", cell: (e) => e.offering.faculty?.name ?? "—", className: "hidden md:table-cell" },
    { header: "Tuition", cell: (e) => formatMoney(fee(e)), className: "tabular-nums" },
    { header: "Status", cell: (e) => <StatusBadge status={e.status} /> },
    { header: "Payment", cell: (e) => <StatusBadge status={e.paymentStatus} />, className: "hidden sm:table-cell" },
    {
      header: "Actions",
      className: "text-right",
      cell: (e) => {
        const open = e.status !== "CANCELLED" && e.paymentStatus !== "PAID";
        if (!open) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="accent" loading={pay.isPending && pay.variables === e.id} disabled={pay.isPending} onClick={() => pay.mutate(e.id)}>
              <CreditCard /> Pay
            </Button>
            <Button size="sm" variant="outline" disabled={cancel.isPending} onClick={() => cancel.mutate(e.id)}>
              Cancel
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active enrollments" value={active.length} icon={<GraduationCap />} />
        <StatCard label="Confirmed" value={confirmed} icon={<CheckCircle2 />} hint={`${credits} credit hours`} />
        <StatCard label="Awaiting payment" value={active.length - confirmed} icon={<Clock />} />
        <StatCard label="Tuition due" value={formatMoney(due)} icon={<DollarSign />} hint={`$${FEE_PER_CREDIT} per credit`} />
      </div>
      <div className="mt-6">
        <DataTable
          caption="My enrollments"
          columns={columns}
          rows={data}
          empty={
            <EmptyState
              icon={<BookPlus />}
              title="You haven't enrolled in anything yet"
              description="Browse this semester's offerings and reserve your seats."
              action={
                <Button asChild>
                  <Link href="/student/enroll">Enroll in a course</Link>
                </Button>
              }
            />
          }
        />
      </div>
      {data.some((e) => e.status === "CANCELLED") && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <XCircle className="size-3.5" /> Cancelled enrollments stay listed for your records.
        </p>
      )}
    </>
  );
}
