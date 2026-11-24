import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about enrollment, tuition payment, grading and accounts at Meridian University.",
  openGraph: { title: "Frequently asked questions", description: "Enrollment, tuition and grading answers." },
};

const FAQS = [
  { q: "How do I enroll in a course?", a: "Sign in as a student, open “Enroll in a course”, choose a semester and an offering, review the summary and confirm. Your seat is held as pending until tuition is paid." },
  { q: "How is tuition calculated?", a: "Tuition is charged per credit hour. The amount for each course is shown before you are redirected to Stripe Checkout." },
  { q: "Can I use a real card?", a: "No. Payments run in Stripe test mode. Use card number 4242 4242 4242 4242 with any future expiry date and any CVC." },
  { q: "Can I cancel an enrollment?", a: "Yes, until it is paid. Paid enrollments are confirmed and can't be cancelled from the student portal." },
  { q: "When do I see my grades?", a: "As soon as faculty save marks for an exam. Results appear in your Results page with the percentage and letter grade." },
  { q: "How do I become faculty or an administrator?", a: "Public registration creates student accounts only. An administrator can promote an account from the Users page." },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-semibold">Frequently asked questions</h1>
      <div className="mt-8 divide-y rounded-xl border bg-card">
        {FAQS.map((f) => (
          <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
              {f.q}
              <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
