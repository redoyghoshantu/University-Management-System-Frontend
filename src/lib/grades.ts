/** Same thresholds as the backend's calculateGrade, used for instant optimistic feedback. */
export function gradeFor(marks: number, total: number): string {
  const pct = (marks / total) * 100;
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

export const GRADE_ORDER = ["A+", "A", "B", "C", "D", "F"] as const;
