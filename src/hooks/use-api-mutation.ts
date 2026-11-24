"use client";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/** Mutation helper: success toast + refresh Server Components so tables show fresh data. Errors toast globally. */
export function useApiMutation<TVars, TData = unknown>(
  mutationFn: (vars: TVars) => Promise<TData>,
  options: { success?: string; onSuccess?: (data: TData, vars: TVars) => void } = {},
) {
  const router = useRouter();
  return useMutation({
    mutationFn,
    onSuccess: (data, vars) => {
      if (options.success) toast.success(options.success);
      router.refresh();
      options.onSuccess?.(data, vars);
    },
  });
}
