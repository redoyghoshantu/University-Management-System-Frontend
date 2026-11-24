import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { publicGet } from "@/lib/api/public";
import type { Course, Department, Paginated } from "@/types";

export const metadata: Metadata = {
  title: "Course catalog",
  description: "Search and filter every course offered at Meridian University by department.",
  openGraph: { title: "Course catalog", description: "Search every course by title, code or department." },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function CoursesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const [courses, departments] = await Promise.all([
    publicGet<Paginated<Course>>("/courses", { search: first(sp.search), departmentId: first(sp.departmentId), page: first(sp.page), limit: "9" }, 30),
    publicGet<Department[]>("/departments"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold sm:text-4xl">Course catalog</h1>
      <p className="mt-2 text-muted-foreground">Filters live in the URL, so you can bookmark or share any view.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <SearchInput placeholder="Search by title or code" />
        <FilterSelect
          param="departmentId"
          label="Filter by department"
          allLabel="All departments"
          options={(departments ?? []).map((d) => ({ value: d.id, label: d.name }))}
        />
      </div>

      {!courses ? (
        <Card className="mt-6">
          <EmptyState title="Couldn't load courses" description="The server may be waking up. Refresh in a few seconds." />
        </Card>
      ) : courses.data.length === 0 ? (
        <Card className="mt-6">
          <EmptyState icon={<SearchX />} title="No courses match" description="Try a different search term or clear the department filter." />
        </Card>
      ) : (
        <>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.data.map((c) => (
              <li key={c.id}>
                <Card className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <Badge>{c.code}</Badge>
                    <span className="text-xs text-muted-foreground">{c.credits} credits</span>
                  </div>
                  <h2 className="font-sans text-base font-semibold leading-snug">{c.title}</h2>
                  <p className="mt-auto text-sm text-muted-foreground">{c.department?.name}</p>
                </Card>
              </li>
            ))}
          </ul>
          <Pagination meta={courses.meta} />
        </>
      )}
    </div>
  );
}
