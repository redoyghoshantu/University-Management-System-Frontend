import type { Role } from "@/types";

/** Public demo accounts (also listed in the backend README) used by the one-click login buttons. */
export const DEMO_ACCOUNTS: { role: Role; label: string; email: string; password: string; blurb: string }[] = [
  { role: "ADMIN", label: "Admin", email: "admin@antu.com", password: "admin123", blurb: "Users, courses, offerings, audit logs" },
  { role: "FACULTY", label: "Faculty", email: "faculty@rahman.com", password: "123456", blurb: "Classes, rosters, exams and grading" },
  { role: "STUDENT", label: "Student", email: "student@gmail.com", password: "123456", blurb: "Enroll, pay tuition, view results" },
];
