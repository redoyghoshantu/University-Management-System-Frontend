import type { Metadata } from "next";
import { DepartmentManager, SemesterManager } from "@/components/admin/academics-managers";
import { PageHeader } from "@/components/shared/page-header";
import { serverGet } from "@/lib/api/server";
import type { Department, Semester } from "@/types";

export const metadata: Metadata = { title: "Departments & semesters" };

export default async function AcademicsPage() {
  const [departments, semesters] = await Promise.all([serverGet<Department[]>("/departments"), serverGet<Semester[]>("/semesters")]);
  return (
    <>
      <PageHeader title="Departments & semesters" description="The academic structure every course and offering hangs from." />
      <div className="grid gap-6 lg:grid-cols-2">
        <DepartmentManager departments={departments} />
        <SemesterManager semesters={semesters} />
      </div>
    </>
  );
}
