"use client";
import { Select } from "@/components/ui/input";
import { useUrlState } from "@/hooks/use-url-state";

export function FilterSelect({
  param,
  label,
  options,
  allLabel = "All",
}: {
  param: string;
  label: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}) {
  const { params, setParam } = useUrlState();
  return (
    <Select
      aria-label={label}
      value={params.get(param) ?? ""}
      onChange={(e) => setParam(param, e.target.value || null)}
      className="w-full sm:w-48"
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
