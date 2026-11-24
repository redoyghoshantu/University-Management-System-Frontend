import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

/** Reusable table with a built-in empty state; works in both Server and Client Components. */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  empty: React.ReactNode;
  caption?: string;
}) {
  if (rows.length === 0) return <Card>{empty}</Card>;
  return (
    <Card className="overflow-hidden">
      <Table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead key={c.header} className={c.className}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((c) => (
                <TableCell key={c.header} className={cn(c.className)}>
                  {c.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
