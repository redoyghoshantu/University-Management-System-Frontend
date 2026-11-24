import type { Metadata } from "next";
import Image from "next/image";
import { CalendarCheck, FileSpreadsheet, Lock, Workflow } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "How the Meridian University portal works for students, faculty and administrators.",
  openGraph: { title: "About the Meridian portal", description: "Enrollment, tuition and grading in one workflow." },
};

const FLOW = [
  { icon: CalendarCheck, title: "1 · Admin schedules", text: "Departments, courses and semesters are combined into course offerings with a faculty member and a seat capacity." },
  { icon: Workflow, title: "2 · Student enrolls", text: "A student picks an offering. A seat is held as PENDING while the enrollment waits for payment." },
  { icon: Lock, title: "3 · Tuition is paid", text: "Stripe Checkout confirms the payment, which flips the enrollment to CONFIRMED." },
  { icon: FileSpreadsheet, title: "4 · Faculty grades", text: "Faculty create exams and enter marks for confirmed students; letter grades are computed automatically." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold">A portal that mirrors how a semester really runs</h1>
          <p className="text-muted-foreground">
            Meridian replaces spreadsheets and paper forms with a single, role-aware workflow. Every action is
            permission-checked on the server and written to an audit log, so administrators always know who changed what.
          </p>
          <p className="text-muted-foreground">
            Soft deletion keeps historical records intact, seat limits are enforced inside a database transaction, and
            payments are verified directly with Stripe — not trusted from the browser.
          </p>
        </div>
        <Image src="/campus.svg" alt="University hall illustration" width={640} height={460} className="h-auto w-full rounded-3xl border" />
      </div>

      <h2 className="mt-16 text-2xl font-semibold sm:text-3xl">The semester lifecycle</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FLOW.map((s) => (
          <Card key={s.title} className="p-5">
            <s.icon className="mb-3 size-6 text-primary" />
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
