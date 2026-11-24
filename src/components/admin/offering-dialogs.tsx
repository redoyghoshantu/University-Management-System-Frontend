"use client";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Field } from "@/components/shared/field";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Course, Offering, Semester, User } from "@/types";

const schema = z.object({
  courseId: z.string().min(1, "Choose a course"),
  semesterId: z.string().min(1, "Choose a semester"),
  facultyId: z.string().min(1, "Assign a faculty member"),
  capacity: z.number({ error: "Enter a capacity" }).int("Must be a whole number").min(1, "At least 1 seat").max(500, "Capacity is capped at 500"),
});
type Values = z.infer<typeof schema>;

const STEPS = ["Course", "Schedule", "Review"] as const;
const STEP_FIELDS: (keyof Values)[][] = [["courseId"], ["semesterId", "facultyId"], ["capacity"]];

/** Three-step wizard: pick a course → pick semester & faculty → set capacity and confirm. */
export function OfferingWizard({ courses, semesters, faculty }: { courses: Course[]; semesters: Semester[]; faculty: User[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const {
    register,
    handleSubmit,
    trigger,
    control,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { courseId: "", semesterId: "", facultyId: "", capacity: 40 },
  });
  const v = useWatch({ control });

  const create = useApiMutation((values: Values) => api("/course-offerings", { method: "POST", body: values }), {
    success: "Offering scheduled",
    onSuccess: () => {
      setOpen(false);
      setStep(0);
      reset();
    },
  });

  async function next() {
    if (await trigger(STEP_FIELDS[step])) setStep((s) => s + 1);
  }

  const course = courses.find((c) => c.id === v.courseId);
  const semester = semesters.find((s) => s.id === v.semesterId);
  const teacher = faculty.find((f) => f.id === v.facultyId);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Schedule offering
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule an offering</DialogTitle>
            <DialogDescription>Step {step + 1} of {STEPS.length}: {STEPS[step]}</DialogDescription>
          </DialogHeader>

          <ol className="flex items-center gap-2" aria-label="Progress">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  aria-current={i === step ? "step" : undefined}
                  className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold", i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
                >
                  {i < step ? <Check className="size-4" /> : i + 1}
                </span>
                <span className="hidden text-xs sm:inline">{label}</span>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
              </li>
            ))}
          </ol>

          <form onSubmit={handleSubmit((values) => create.mutate(values))} className="grid gap-4" noValidate>
            {step === 0 && (
              <Field label="Course" htmlFor="o-course" error={errors.courseId?.message}>
                <Select id="o-course" aria-invalid={!!errors.courseId} {...register("courseId")}>
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            {step === 1 && (
              <>
                <Field label="Semester" htmlFor="o-sem" error={errors.semesterId?.message}>
                  <Select id="o-sem" aria-invalid={!!errors.semesterId} {...register("semesterId")}>
                    <option value="">Select a semester</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Faculty member" htmlFor="o-fac" error={errors.facultyId?.message} hint={faculty.length === 0 ? "No faculty accounts yet — promote a user on the Users page." : undefined}>
                  <Select id="o-fac" aria-invalid={!!errors.facultyId} {...register("facultyId")}>
                    <option value="">Select faculty</option>
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Seat capacity" htmlFor="o-cap" error={errors.capacity?.message}>
                  <Input id="o-cap" type="number" min={1} aria-invalid={!!errors.capacity} {...register("capacity", { valueAsNumber: true })} />
                </Field>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg bg-muted p-4 text-sm">
                  <dt className="text-muted-foreground">Course</dt>
                  <dd className="font-medium">{course ? `${course.code} — ${course.title}` : "—"}</dd>
                  <dt className="text-muted-foreground">Semester</dt>
                  <dd className="font-medium">{semester?.name ?? "—"}</dd>
                  <dt className="text-muted-foreground">Faculty</dt>
                  <dd className="font-medium">{teacher?.name ?? "—"}</dd>
                </dl>
              </>
            )}

            <div className="flex justify-between gap-2 pt-2">
              <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={next}>
                  Next <ArrowRight />
                </Button>
              ) : (
                <Button type="submit" loading={create.isPending}>
                  Schedule offering
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

const editSchema = z.object({
  facultyId: z.string().min(1, "Assign a faculty member"),
  capacity: z.number({ error: "Enter a capacity" }).int().min(1, "At least 1 seat").max(500, "Capacity is capped at 500"),
});
type EditValues = z.infer<typeof editSchema>;

export function OfferingRowActions({ offering, faculty }: { offering: Offering; faculty: User[] }) {
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { facultyId: offering.facultyId, capacity: offering.capacity },
  });

  const save = useApiMutation((body: EditValues) => api(`/course-offerings/${offering.id}`, { method: "PATCH", body }), {
    success: "Offering updated",
    onSuccess: () => setEdit(false),
  });
  const remove = useApiMutation(() => api(`/course-offerings/${offering.id}`, { method: "DELETE" }), {
    success: "Offering removed",
    onSuccess: () => setConfirm(false),
  });

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" className="size-8" aria-label={`Edit ${offering.course.code} offering`} onClick={() => setEdit(true)}>
        <Pencil />
      </Button>
      <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label={`Remove ${offering.course.code} offering`} onClick={() => setConfirm(true)}>
        <Trash2 />
      </Button>
      <Dialog open={edit} onOpenChange={setEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {offering.course.code} offering</DialogTitle>
            <DialogDescription>{offering.semester.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4" noValidate>
            <Field label="Faculty member" htmlFor="e-fac" error={errors.facultyId?.message}>
              <Select id="e-fac" {...register("facultyId")}>
                {faculty.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Seat capacity" htmlFor="e-cap" error={errors.capacity?.message}>
              <Input id="e-cap" type="number" min={1} {...register("capacity", { valueAsNumber: true })} />
            </Field>
            <Button type="submit" loading={save.isPending}>
              Save changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Remove this offering?"
        description="Students will no longer see it in the enrollment wizard. Existing enrollments keep their history."
        confirmLabel="Remove offering"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate(undefined)}
      />
    </div>
  );
}
