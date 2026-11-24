import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, CreditCard, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { publicGet } from "@/lib/api/public";
import type { Course, Department, Paginated } from "@/types";

const ROLES = [
  { icon: GraduationCap, title: "Students", text: "Browse the catalog, enroll through a guided wizard, pay tuition securely with Stripe and track every result." },
  { icon: BookOpenCheck, title: "Faculty", text: "See your classes and confirmed rosters, create midterm and final exams, and grade with automatic letter grades." },
  { icon: ShieldCheck, title: "Administrators", text: "Manage users and roles, build the academic structure, schedule offerings and audit every change." },
];

export default async function HomePage() {
  const [departments, courses] = await Promise.all([
    publicGet<Department[]>("/departments"),
    publicGet<Paginated<Course>>("/courses", { limit: "6" }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <div className="space-y-6">
            <Badge variant="warning">Fall enrollment is open</Badge>
            <h1 className="text-4xl font-semibold leading-[1.1] sm:text-5xl">
              Your whole university life, in one calm portal.
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Meridian connects students, faculty and administrators — from picking a course and paying tuition to
              publishing grades — without the paperwork.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">
                  Create student account <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Try a demo role</Link>
              </Button>
            </div>
          </div>
          <Image
            src="/campus.svg"
            alt="Illustration of a university hall with a clock tower"
            width={640}
            height={460}
            priority
            className="h-auto w-full rounded-3xl border shadow-sm"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl">Built for three kinds of people</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {ROLES.map((r) => (
            <Card key={r.title} className="p-6">
              <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <r.icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {departments && departments.length > 0 && (
        <section className="border-y bg-secondary/50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-semibold sm:text-3xl">Departments</h2>
            <p className="mt-1 text-muted-foreground">{departments.length} departments, live from the university database.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {departments.slice(0, 6).map((d) => (
                <li key={d.id}>
                  <Link href={`/courses?departmentId=${d.id}`} className="flex items-center justify-between rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
                    <span className="font-medium">{d.name}</span>
                    <Badge variant="outline">{d.code}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {courses && courses.data.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold sm:text-3xl">Featured courses</h2>
            <Button asChild variant="link">
              <Link href="/courses">
                See all {courses.meta.total} <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.data.map((c) => (
              <Card key={c.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <Badge>{c.code}</Badge>
                  <span className="text-xs text-muted-foreground">{c.credits} credits</span>
                </div>
                <h3 className="font-semibold leading-snug">{c.title}</h3>
                <p className="mt-auto text-sm text-muted-foreground">{c.department?.name}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Card className="flex flex-col items-start gap-5 bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <CreditCard className="mt-1 size-8 shrink-0 text-accent" />
            <div>
              <h2 className="text-2xl font-semibold">Pay tuition in a minute</h2>
              <p className="mt-1 text-primary-foreground/80">Secure Stripe checkout with instant confirmation of your seat.</p>
            </div>
          </div>
          <Button asChild variant="accent" size="lg">
            <Link href="/register">
              <Users /> Join now
            </Link>
          </Button>
        </Card>
      </section>
    </>
  );
}
