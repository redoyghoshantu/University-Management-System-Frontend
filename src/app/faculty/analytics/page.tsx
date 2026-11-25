import type { Metadata } from "next";
import { BarChart3, CheckCircle2, ClipboardCheck, Users } from "lucide-react";
import { GradeCharts } from "@/components/faculty/grade-charts";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { serverGet } from "@/lib/api/server";
import { GRADE_ORDER } from "@/lib/grades";
import type { MyOffering, Roster } from "@/types";

export const metadata: Metadata = { title: "Grade analytics" };

export default async function FacultyAnalyticsPage() {
  const offerings = await serverGet<MyOffering[]>("/course-offerings/my-offerings");
  const rosters = await Promise.all(offerings.map((o) => serverGet<Roster>(`/course-offerings/${o.id}/roster`)));

  const counts = Object.fromEntries(GRADE_ORDER.map((g) => [g, 0])) as Record<string, number>;
  let results = 0;
  let passed = 0;
  let students = 0;
  const averages: { name: string; average: number }[] = [];

  rosters.forEach((r) => {
    students += r.enrollments.length;
    const totals = new Map(r.offering.exams.map((e) => [e.id, e.totalMarks]));
    const pcts: number[] = [];
    r.enrollments.forEach((e) =>
      e.results.forEach((res) => {
        results += 1;
        if (res.grade) {
          counts[res.grade] = (counts[res.grade] ?? 0) + 1;
          if (res.grade !== "F") passed += 1;
        }
        const total = totals.get(res.examId);
        if (total) pcts.push((res.marksObtained / total) * 100);
      }),
    );
    if (pcts.length) averages.push({ name: r.offering.course.code, average: Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 10) / 10 });
  });

  const distribution = GRADE_ORDER.map((grade) => ({ grade, count: counts[grade] }));
  const overall = averages.length ? Math.round((averages.reduce((s, a) => s + a.average, 0) / averages.length) * 10) / 10 : 0;

  return (
    <>
      <PageHeader title="Grade analytics" description="How your students are performing across every class you teach." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Confirmed students" value={students} icon={<Users />} />
        <StatCard label="Graded results" value={results} icon={<ClipboardCheck />} />
        <StatCard label="Pass rate" value={results ? `${Math.round((passed / results) * 100)}%` : "—"} icon={<CheckCircle2 />} />
        <StatCard label="Average score" value={results ? `${overall}%` : "—"} icon={<BarChart3 />} />
      </div>
      <div className="mt-6">
        {results === 0 ? (
          <Card>
            <EmptyState icon={<BarChart3 />} title="No graded results yet" description="Charts appear once you enter marks for an exam in one of your classes." />
          </Card>
        ) : (
          <GradeCharts distribution={distribution} averages={averages} />
        )}
      </div>
    </>
  );
}
