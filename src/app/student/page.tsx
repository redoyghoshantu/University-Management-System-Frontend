import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EnrollmentList } from "@/components/student/enrollment-list";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser, serverGet } from "@/lib/api/server";
import type { Enrollment } from "@/types";

export const metadata: Metadata = { title: "My enrollments" };

export default async function StudentHomePage() {
  const [user, enrollments] = await Promise.all([getCurrentUser(), serverGet<Enrollment[]>("/enrollments/my-enrollments")]);
  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]}`}
        description="Your courses, tuition and payment status at a glance."
        actions={
          <Button asChild>
            <Link href="/student/enroll">
              <Plus /> Enroll in a course
            </Link>
          </Button>
        }
      />
      <EnrollmentList initialData={enrollments} />
    </>
  );
}
