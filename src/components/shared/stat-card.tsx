import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-serif text-3xl font-semibold tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && <div className="rounded-lg bg-primary/10 p-2.5 text-primary [&_svg]:size-5">{icon}</div>}
      </div>
    </Card>
  );
}
