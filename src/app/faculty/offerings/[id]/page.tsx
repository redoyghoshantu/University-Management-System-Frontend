import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GradingPanel } from "@/components/faculty/grading-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { serverGet } from "@/lib/api/server";
import type { Roster } from "@/types";

export const metadata: Metadata = { title: "Roster & grading" };

export default async function OfferingRosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roster = await serverGet<Roster>(`/course-offerings/${id}/roster`);
  const { course, semester } = roster.offering;

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link href="/faculty">
          <ArrowLeft /> All classes
        </Link>
      </Button>
      <PageHeader
        title={course.title}
        description={`${semester.name} · ${roster.enrollments.length} confirmed student${roster.enrollments.length === 1 ? "" : "s"} · ${course.credits} credits`}
        actions={<Badge>{course.code}</Badge>}
      />
      <GradingPanel offeringId={id} initialData={roster} />
    </>
  );
}
