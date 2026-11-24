"use client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const queryClient = useQueryClient();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    queryClient.clear();
    toast.success("Signed out");
    router.replace("/login");
    router.refresh();
  }

  return { user, role: user?.role ?? null, logout };
}
