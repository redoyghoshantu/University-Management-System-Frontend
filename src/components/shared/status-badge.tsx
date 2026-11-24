import { Badge } from "@/components/ui/badge";

const MAP: Record<string, { variant: "success" | "warning" | "destructive" | "secondary" | "default"; label: string }> = {
  CONFIRMED: { variant: "success", label: "Confirmed" },
  PAID: { variant: "success", label: "Paid" },
  PENDING: { variant: "warning", label: "Pending" },
  CANCELLED: { variant: "secondary", label: "Cancelled" },
  FAILED: { variant: "destructive", label: "Failed" },
  ADMIN: { variant: "destructive", label: "Admin" },
  FACULTY: { variant: "default", label: "Faculty" },
  STUDENT: { variant: "secondary", label: "Student" },
};

export function StatusBadge({ status }: { status: string }) {
  const item = MAP[status] ?? { variant: "secondary" as const, label: status };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
