"use client";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)", fontSize: 12 };

const GRADE_COLOR: Record<string, string> = {
  "A+": "var(--chart-3)",
  A: "var(--chart-3)",
  B: "var(--chart-1)",
  C: "var(--chart-2)",
  D: "var(--chart-2)",
  F: "var(--chart-4)",
};

export function GradeCharts({ distribution, averages }: { distribution: { grade: string; count: number }[]; averages: { name: string; average: number }[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Grade distribution</CardTitle>
          <CardDescription>Letter grades across all your graded exams</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label={`Grade distribution: ${distribution.map((d) => `${d.grade} ${d.count}`).join(", ")}`} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ left: -16, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="grade" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v) => [v, "Students"]} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {distribution.map((d) => (
                    <Cell key={d.grade} fill={GRADE_COLOR[d.grade]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average score by class</CardTitle>
          <CardDescription>Mean percentage across graded results</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label={`Average by class: ${averages.map((a) => `${a.name} ${a.average}%`).join(", ")}`} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={averages} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" domain={[0, 100]} unit="%" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="name" width={84} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v) => [`${v}%`, "Average"]} />
                <Bar dataKey="average" fill="var(--chart-1)" radius={[0, 6, 6, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
