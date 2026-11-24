import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentUser } from "@/lib/api/server";

/** Server Component: verifies the session with the backend once per layout mount and hands the user to the client shell. */
export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
