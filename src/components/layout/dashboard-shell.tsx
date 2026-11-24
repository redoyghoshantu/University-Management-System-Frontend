"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  BookPlus,
  Building2,
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";
import type { Role, User } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/offerings", label: "Offerings", icon: CalendarRange },
    { href: "/admin/academics", label: "Departments & semesters", icon: Building2 },
    { href: "/admin/reports", label: "Audit logs", icon: ScrollText },
  ],
  STUDENT: [
    { href: "/student", label: "My enrollments", icon: LayoutDashboard },
    { href: "/student/enroll", label: "Enroll in a course", icon: BookPlus },
    { href: "/student/results", label: "Results", icon: Award },
    { href: "/student/payments", label: "Payments", icon: CreditCard },
    { href: "/student/profile", label: "Profile", icon: UserCog },
  ],
  FACULTY: [
    { href: "/faculty", label: "My classes", icon: LayoutDashboard },
    { href: "/faculty/analytics", label: "Grade analytics", icon: BarChart3 },
    { href: "/faculty/profile", label: "Profile", icon: UserCog },
  ],
};

function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1 px-3">
      {NAV[role].map((item) => {
        const active = item.href === ROLE_HOME[role] ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className={cn("size-4", active && "text-accent")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 py-5">
      <div className="px-5">
        <Logo light href={ROLE_HOME[role]} />
        <p className="mt-3 text-xs uppercase tracking-widest text-sidebar-muted">{ROLE_LABEL[role]} portal</p>
      </div>
      <NavLinks role={role} onNavigate={onNavigate} />
    </div>
  );
}

export function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileNavOpen);
  const { logout } = useAuth();

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh bg-sidebar text-sidebar-foreground lg:block">
        <SidebarBody role={user.role} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Dashboard navigation links</SheetDescription>
          <SidebarBody role={user.role} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Menu />
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-11 gap-2.5 px-2" aria-label="Account menu">
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials(user.name)}
                  </span>
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-medium">{user.name}</span>
                    <span className="block text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex items-center justify-between gap-3">
                  <span className="truncate">{user.email}</span>
                  <StatusBadge status={user.role} />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">Public site</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void logout()}>
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
