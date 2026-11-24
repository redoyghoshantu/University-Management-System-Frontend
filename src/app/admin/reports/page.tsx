import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { serverGet } from "@/lib/api/server";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { first, type SearchParams } from "@/lib/paginate";
import { formatDate } from "@/lib/utils";
import type { AuditLog, Paginated } from "@/types";

export const metadata: Metadata = { title: "Audit logs" };

export default async function AuditLogsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const logs = await serverGet<Paginated<AuditLog>>("/admin/audit-logs", { action: first(sp.action), page: first(sp.page), limit: "12" });

  const columns: Column<AuditLog>[] = [
    { header: "When", cell: (l) => formatDate(l.createdAt, { dateStyle: "medium", timeStyle: "short" }), className: "whitespace-nowrap" },
    {
      header: "Actor",
      cell: (l) => (
        <div>
          <p className="font-medium">{l.user.name}</p>
          <p className="text-xs text-muted-foreground">{l.user.email}</p>
        </div>
      ),
    },
    { header: "Action", cell: (l) => <Badge variant="secondary">{l.action}</Badge> },
    { header: "Entity", cell: (l) => l.entityType, className: "hidden md:table-cell" },
    { header: "Entity ID", cell: (l) => <code className="text-xs text-muted-foreground">{l.entityId.slice(0, 8)}…</code>, className: "hidden lg:table-cell" },
  ];

  return (
    <>
      <PageHeader title="Audit logs" description="A tamper-evident trail of role changes, deletions, payments and grading." />
      <div className="mb-4">
        <FilterSelect param="action" label="Filter by action" allLabel="All actions" options={AUDIT_ACTIONS.map((a) => ({ value: a, label: a.replaceAll("_", " ") }))} />
      </div>
      <DataTable
        caption="Audit logs"
        columns={columns}
        rows={logs.data}
        empty={<EmptyState icon={<ScrollText />} title="No log entries" description="Nothing matches this filter yet." />}
      />
      <Pagination meta={logs.meta} />
    </>
  );
}
