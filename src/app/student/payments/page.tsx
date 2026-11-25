import type { Metadata } from "next";
import { CreditCard, DollarSign } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { serverGet } from "@/lib/api/server";
import { first, paginateLocal, type SearchParams } from "@/lib/paginate";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Payment } from "@/types";

export const metadata: Metadata = { title: "Payments" };

export default async function StudentPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const all = await serverGet<Payment[]>("/payments/my-payments");
  const status = first(sp.status);
  const filtered = status ? all.filter((p) => p.status === status) : all;
  const { rows, meta } = paginateLocal(filtered, first(sp.page), 8);
  const paid = all.filter((p) => p.status === "PAID");
  const total = paid.reduce((s, p) => s + Number(p.amount), 0);

  const columns: Column<Payment>[] = [
    { header: "Date", cell: (p) => formatDate(p.createdAt, { dateStyle: "medium", timeStyle: "short" }), className: "whitespace-nowrap" },
    {
      header: "Course",
      cell: (p) =>
        p.enrollment?.offering?.course ? (
          <div>
            <p className="font-medium">{p.enrollment.offering.course.title}</p>
            <p className="text-xs text-muted-foreground">{p.enrollment.offering.course.code}</p>
          </div>
        ) : (
          <span className="text-muted-foreground">Tuition payment</span>
        ),
      className: "hidden sm:table-cell",
    },
    { header: "Amount", cell: (p) => formatMoney(Number(p.amount)), className: "tabular-nums" },
    { header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <>
      <PageHeader title="Payments" description="Every Stripe checkout you have started, with its outcome." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total paid" value={formatMoney(total)} icon={<DollarSign />} />
        <StatCard label="Successful payments" value={paid.length} icon={<CreditCard />} />
        <StatCard label="Attempts" value={all.length} />
      </div>
      <div className="mb-4 mt-6">
        <FilterSelect
          param="status"
          label="Filter by status"
          allLabel="All statuses"
          options={[{ value: "PAID", label: "Paid" }, { value: "PENDING", label: "Pending" }, { value: "FAILED", label: "Failed" }]}
        />
      </div>
      <DataTable
        caption="Payment history"
        columns={columns}
        rows={rows}
        empty={<EmptyState icon={<CreditCard />} title="No payments yet" description="Payments show up here once you start checkout for an enrollment." />}
      />
      <Pagination meta={meta} />
    </>
  );
}
