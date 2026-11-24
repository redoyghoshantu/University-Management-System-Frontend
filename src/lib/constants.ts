import type { Role } from "@/types";

export const ACCESS_COOKIE = "ums_access";
export const REFRESH_COOKIE = "ums_refresh";

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  STUDENT: "/student",
  FACULTY: "/faculty",
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  STUDENT: "Student",
  FACULTY: "Faculty",
};

export const PROTECTED_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/student", role: "STUDENT" },
  { prefix: "/faculty", role: "FACULTY" },
];

export const SITE_NAME = "Meridian University";
