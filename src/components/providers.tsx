"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster, toast } from "sonner";
import { ApiError } from "@/lib/api/errors";

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [client] = useState(() => {
    const onError = (error: unknown) => {
      // An expired/invalid session sends the user back to sign in; everything else is a toast.
      if (error instanceof ApiError && error.status === 401) {
        toast.error("Your session has expired. Please sign in again.");
        router.replace("/login?reason=expired");
        return;
      }
      toast.error(messageOf(error));
    };
    return new QueryClient({
        queryCache: new QueryCache({ onError }),
        mutationCache: new MutationCache({ onError }),
        defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
      });
  });

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={client}>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
