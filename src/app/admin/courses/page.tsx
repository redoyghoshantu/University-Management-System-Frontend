import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { CourseRowActions, NewCourseButton } from "@/components/admin/course-dialogs";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { serverGet } from "@/lib/api/server";
import { first, type SearchParams } from "@/lib/paginate";
import type { Course, Department, Paginated } from "@/types";

export const metadata: Metadata = { title: "Courses" };

export default async function AdminCoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const [courses, departments] = await Promise.all([
    serverGet<Paginated<Course>>("/courses", { search: first(sp.search), departmentId: first(sp.departmentId), page: first(sp.page), limit: "10" }),
    serverGet<Department[]>("/departments"),
  ]);

  const columns: Column<Course>[] = [
    { header: "Code", cell: (c) => <Badge>{c.code}</Badge> },
    { header: "Title", cell: (c) => <span className="font-medium">{c.title}</span> },
    { header: "Department", cell: (c) => c.department?.name ?? "—", className: "hidden md:table-cell" },
    { header: "Credits", cell: (c) => c.credits, className: "tabular-nums" },
    { header: "Actions", cell: (c) => <CourseRowActions course={c} departments={departments} />, className: "text-right" },
  ];

  return (
    <>
      <PageHeader title="Courses" description="Manage the course catalog. Filters and pagination are kept in the URL." actions={<NewCourseButton departments={departments} />} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput placeholder="Search title or code" />
        <FilterSelect param="departmentId" label="Filter by department" allLabel="All departments" options={departments.map((d) => ({ value: d.id, label: d.name }))} />
      </div>
      <DataTable
        caption="Courses"
        columns={columns}
        rows={courses.data}
        empty={<EmptyState icon={<SearchX />} title="No courses found" description="Add a course or adjust your filters." />}
      />
      <Pagination meta={courses.meta} />
    </>
  );
}
