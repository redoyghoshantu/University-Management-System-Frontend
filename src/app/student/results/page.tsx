import type { Metadata } from "next";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { StatCard } from "@/components/shared/stat-card";
import { serverGet } from "@/lib/api/server";
import { first, paginateLocal, type SearchParams } from "@/lib/paginate";
import type { MyResult } from "@/types";

export const metadata: Metadata = { title: "Results" };

const pct = (r: MyResult) => (r.marksObtained / r.exam.totalMarks) * 100;
const gradeVariant = (g: string | null) => (g === "F" ? "destructive" : g === "D" || g === "C" ? "warning" : "success");

export default async function StudentResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const all = await serverGet<MyResult[]>("/results/my-results");
  const type = first(sp.type);
  const filtered = type ? all.filter((r) => r.exam.type === type) : all;
  const { rows, meta } = paginateLocal(filtered, first(sp.page), 8);
  const average = all.length ? all.reduce((s, r) => s + pct(r), 0) / all.length : 0;
  const best = all.reduce<MyResult | null>((b, r) => (!b || pct(r) > pct(b) ? r : b), null);

  const columns: Column<MyResult>[] = [
    {
      header: "Course",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.enrollment.offering.course.title}</p>
          <p className="text-xs text-muted-foreground">{r.enrollment.offering.semester.name}</p>
        </div>
      ),
    },
    { header: "Exam", cell: (r) => <Badge variant="secondary">{r.exam.type === "MIDTERM" ? "Midterm" : "Final"}</Badge> },
    { header: "Marks", cell: (r) => `${r.marksObtained} / ${r.exam.totalMarks}`, className: "tabular-nums" },
    { header: "Score", cell: (r) => `${pct(r).toFixed(1)}%`, className: "tabular-nums hidden sm:table-cell" },
    { header: "Grade", cell: (r) => <Badge variant={gradeVariant(r.grade)}>{r.grade ?? "—"}</Badge> },
  ];

  return (
    <>
      <PageHeader title="Results" description="Marks and letter grades published by your instructors." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Exams graded" value={all.length} icon={<Award />} />
        <StatCard label="Average score" value={all.length ? `${average.toFixed(1)}%` : "—"} />
        <StatCard label="Best result" value={best ? best.grade ?? "—" : "—"} hint={best ? best.enrollment.offering.course.code : undefined} />
      </div>
      <div className="mb-4 mt-6">
        <FilterSelect param="type" label="Filter by exam" allLabel="All exams" options={[{ value: "MIDTERM", label: "Midterm" }, { value: "FINAL", label: "Final" }]} />
      </div>
      <DataTable
        caption="My results"
        columns={columns}
        rows={rows}
        empty={<EmptyState icon={<Award />} title="No results yet" description="Grades appear here as soon as your instructors publish them." />}
      />
      <Pagination meta={meta} />
    </>
  );
}
