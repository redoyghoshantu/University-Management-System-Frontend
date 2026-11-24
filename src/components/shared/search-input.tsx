"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlState } from "@/hooks/use-url-state";

/** Debounced search box that writes to ?{param}= */
export function SearchInput({ param = "search", placeholder = "Search…" }: { param?: string; placeholder?: string }) {
  const { params, setParam, isPending } = useUrlState();
  const [value, setValue] = useState(params.get(param) ?? "");
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    if ((params.get(param) ?? "") !== debounced) setParam(param, debounced || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
        data-pending={isPending || undefined}
      />
    </div>
  );
}
