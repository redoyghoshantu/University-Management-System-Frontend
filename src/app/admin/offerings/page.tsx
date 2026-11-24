import type { Metadata } from "next";
import { CalendarX } from "lucide-react";
import { OfferingRowActions, OfferingWizard } from "@/components/admin/offering-dialogs";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { serverGet } from "@/lib/api/server";
import { first, type SearchParams } from "@/lib/paginate";
import type { Course, Offering, Paginated, Semester, User } from "@/types";

export const metadata: Metadata = { title: "Course offerings" };

export default async function AdminOfferingsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const [offerings, semesters, courses, faculty] = await Promise.all([
    serverGet<Paginated<Offering>>("/course-offerings", { semesterId: first(sp.semesterId), facultyId: first(sp.facultyId), page: first(sp.page), limit: "10" }),
    serverGet<Semester[]>("/semesters"),
    serverGet<Paginated<Course>>("/courses", { limit: "100" }),
    serverGet<Paginated<User>>("/admin/users", { role: "FACULTY", limit: "100", sortBy: "name", order: "asc" }),
  ]);

  const columns: Column<Offering>[] = [
    {
      header: "Course",
      cell: (o) => (
        <div>
          <p className="font-medium">{o.course.title}</p>
          <Badge variant="outline" className="mt-1">{o.course.code}</Badge>
        </div>
      ),
    },
    { header: "Semester", cell: (o) => o.semester.name },
    { header: "Faculty", cell: (o) => o.faculty.name, className: "hidden md:table-cell" },
    { header: "Seats", cell: (o) => `${o._count.enrollments} / ${o.capacity}`, className: "tabular-nums" },
    { header: "Actions", cell: (o) => <OfferingRowActions offering={o} faculty={faculty.data} />, className: "text-right" },
  ];

  return (
    <>
      <PageHeader
        title="Course offerings"
        description="A course becomes enrollable once it is scheduled in a semester with a faculty member."
        actions={<OfferingWizard courses={courses.data} semesters={semesters} faculty={faculty.data} />}
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <FilterSelect param="semesterId" label="Filter by semester" allLabel="All semesters" options={semesters.map((s) => ({ value: s.id, label: s.name }))} />
        <FilterSelect param="facultyId" label="Filter by faculty" allLabel="All faculty" options={faculty.data.map((f) => ({ value: f.id, label: f.name }))} />
      </div>
      <DataTable
        caption="Course offerings"
        columns={columns}
        rows={offerings.data}
        empty={<EmptyState icon={<CalendarX />} title="Nothing scheduled" description="Use “Schedule offering” to open a course for enrollment." />}
      />
      <Pagination meta={offerings.meta} />
    </>
  );
}
