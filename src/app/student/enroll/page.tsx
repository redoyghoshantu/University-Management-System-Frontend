import type { Metadata } from "next";
import { EnrollWizard } from "@/components/student/enroll-wizard";
import { PageHeader } from "@/components/shared/page-header";
import { serverGet } from "@/lib/api/server";
import type { Enrollment, Semester } from "@/types";

export const metadata: Metadata = { title: "Enroll in a course" };

export default async function EnrollPage() {
  const [semesters, enrollments] = await Promise.all([serverGet<Semester[]>("/semesters"), serverGet<Enrollment[]>("/enrollments/my-enrollments")]);
  const enrolledOfferingIds = enrollments.filter((e) => e.status !== "CANCELLED").map((e) => e.offeringId);
  // A cancelled enrollment still blocks re-enrolling (unique student+offering), so include those too.
  const blocked = enrollments.map((e) => e.offeringId);
  return (
    <>
      <PageHeader title="Enroll in a course" description="Pick a semester, choose an offering and reserve your seat in three steps." />
      <EnrollWizard semesters={semesters} enrolledOfferingIds={enrolledOfferingIds.length >= blocked.length ? enrolledOfferingIds : blocked} />
    </>
  );
}
