import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, DollarSign, GraduationCap, Users } from "lucide-react";
import { AdminCharts } from "@/components/admin/admin-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { serverGet } from "@/lib/api/server";
import { formatDate, formatMoney } from "@/lib/utils";
import type { AuditLog, DashboardStats, Paginated } from "@/types";

export const metadata: Metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const [stats, logs] = await Promise.all([
    serverGet<DashboardStats>("/admin/dashboard-stats"),
    serverGet<Paginated<AuditLog>>("/admin/audit-logs", { limit: "6" }),
  ]);
  const totalUsers = stats.users.students + stats.users.faculty + stats.users.admins;

  return (
    <>
      <PageHeader title="Campus overview" description="Live numbers from the university database." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active users" value={totalUsers} icon={<Users />} hint={`${stats.users.students} students · ${stats.users.faculty} faculty`} />
        <StatCard label="Courses" value={stats.courses} icon={<BookOpen />} />
        <StatCard label="Enrollments" value={stats.enrollments} icon={<GraduationCap />} hint={`${stats.offerings} offerings scheduled`} />
        <StatCard label="Tuition collected" value={formatMoney(stats.payments.totalRevenue)} icon={<DollarSign />} hint={`${stats.payments.paidCount} paid enrollments`} />
      </div>

      <div className="mt-6">
        <AdminCharts
          users={[
            { name: "Students", value: stats.users.students },
            { name: "Faculty", value: stats.users.faculty },
            { name: "Admins", value: stats.users.admins },
          ]}
          overview={[
            { name: "Courses", value: stats.courses },
            { name: "Offerings", value: stats.offerings },
            { name: "Enrollments", value: stats.enrollments },
          ]}
        />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent activity</CardTitle>
          <Button asChild variant="link" size="sm">
            <Link href="/admin/reports">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {logs.data.length === 0 ? (
            <EmptyState title="No activity yet" description="Actions like role changes and payments will show up here." />
          ) : (
            <ul className="divide-y">
              {logs.data.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span>
                    <span className="font-medium">{l.user.name}</span> <span className="text-muted-foreground">· {l.action.replaceAll("_", " ").toLowerCase()} · {l.entityType}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(l.createdAt, { dateStyle: "medium", timeStyle: "short" })}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
