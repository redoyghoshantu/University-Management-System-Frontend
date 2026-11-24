"use client";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--popover-foreground)",
  fontSize: 12,
};

export function AdminCharts({
  users,
  overview,
}: {
  users: { name: string; value: number }[];
  overview: { name: string; value: number }[];
}) {
  const totalUsers = users.reduce((s, u) => s + u.value, 0);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>People on campus</CardTitle>
          <CardDescription>{totalUsers} active accounts by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label={`Users by role: ${users.map((u) => `${u.name} ${u.value}`).join(", ")}`} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={users} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={3} stroke="var(--card)" strokeWidth={2}>
                  {users.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic activity</CardTitle>
          <CardDescription>Courses, scheduled offerings and enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label={`Activity: ${overview.map((o) => `${o.name} ${o.value}`).join(", ")}`} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview} margin={{ left: -16, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--chart-1)" maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
