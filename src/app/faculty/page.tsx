import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Presentation, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getCurrentUser, serverGet } from "@/lib/api/server";
import { formatDate } from "@/lib/utils";
import type { MyOffering } from "@/types";

export const metadata: Metadata = { title: "My classes" };

export default async function FacultyHomePage() {
  const [user, offerings] = await Promise.all([getCurrentUser(), serverGet<MyOffering[]>("/course-offerings/my-offerings")]);
  const enrolled = offerings.reduce((s, o) => s + o._count.enrollments, 0);
  const seats = offerings.reduce((s, o) => s + o.capacity, 0);

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="The classes you teach. Open one to see its roster and enter grades." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Classes" value={offerings.length} icon={<Presentation />} />
        <StatCard label="Enrollments" value={enrolled} icon={<Users />} hint={`of ${seats} seats`} />
        <StatCard label="Courses taught" value={new Set(offerings.map((o) => o.course.id)).size} icon={<BookOpen />} />
      </div>

      {offerings.length === 0 ? (
        <Card className="mt-6">
          <EmptyState icon={<Presentation />} title="No classes assigned yet" description="An administrator assigns you to a course offering. It will appear here right away." />
        </Card>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {offerings.map((o) => {
            const fill = Math.min((o._count.enrollments / o.capacity) * 100, 100);
            return (
              <li key={o.id}>
                <Card className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-sans text-base font-semibold leading-snug">{o.course.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {o.semester.name} · {formatDate(o.semester.startDate)} → {formatDate(o.semester.endDate)}
                      </p>
                    </div>
                    <Badge>{o.course.code}</Badge>
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>Seats filled</span>
                      <span className="tabular-nums">{o._count.enrollments} / {o.capacity}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(fill)} aria-valuemin={0} aria-valuemax={100} aria-label="Seats filled">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${fill}%` }} />
                    </div>
                  </div>
                  <Button asChild variant="outline" className="mt-auto w-full">
                    <Link href={`/faculty/offerings/${o.id}`}>
                      Roster & grading <ArrowRight />
                    </Link>
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
