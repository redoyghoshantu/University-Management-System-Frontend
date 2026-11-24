export type Role = "STUDENT" | "FACULTY" | "ADMIN";
export type EnrollmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  meta: PageMeta;
  data: T[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  credits: number;
  departmentId: string;
  department?: { name: string; code: string };
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Offering {
  id: string;
  courseId: string;
  semesterId: string;
  facultyId: string;
  capacity: number;
  course: { title: string; code: string; credits: number };
  semester: { name: string };
  faculty: { name: string; email: string };
  _count: { enrollments: number };
}

export interface MyOffering {
  id: string;
  capacity: number;
  course: Course;
  semester: Semester;
  _count: { enrollments: number };
}

export interface EnrollmentOffering {
  id: string;
  capacity: number;
  course: Course;
  semester: Semester;
  faculty?: { name: string };
}

export interface Enrollment {
  id: string;
  studentId: string;
  offeringId: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  offering: EnrollmentOffering;
}

export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  enrollmentId: string | null;
  stripeSessionId: string | null;
  enrollment?: Enrollment | null;
}

export interface Exam {
  id: string;
  offeringId: string;
  type: "MIDTERM" | "FINAL";
  totalMarks: number;
}

export interface ResultRow {
  id: string;
  examId: string;
  enrollmentId: string;
  marksObtained: number;
  grade: string | null;
}

export interface MyResult extends ResultRow {
  exam: Exam;
  enrollment: Enrollment;
}

export interface RosterEntry {
  id: string;
  status: EnrollmentStatus;
  student: { id: string; name: string; email: string };
  results: ResultRow[];
}

export interface Roster {
  offering: { id: string; capacity: number; course: Course; semester: Semester; exams: Exam[] };
  enrollments: RosterEntry[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user: { name: string; email: string };
}

export interface DashboardStats {
  users: { students: number; faculty: number; admins: number };
  courses: number;
  offerings: number;
  enrollments: number;
  payments: { paidCount: number; totalRevenue: number };
}
