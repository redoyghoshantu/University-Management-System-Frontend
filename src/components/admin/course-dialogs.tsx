"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Field } from "@/components/shared/field";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import type { Course, Department } from "@/types";

// Same constraints as the backend validation (credits 1–6, min lengths).
const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  credits: z.number({ error: "Enter the credit hours" }).int("Must be a whole number").min(1, "At least 1 credit").max(6, "At most 6 credits"),
  departmentId: z.string().min(1, "Choose a department"),
});
type Values = z.infer<typeof schema>;

function CourseFormDialog({
  open,
  onOpenChange,
  departments,
  course,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  departments: Department[];
  course?: Course;
}) {
  const editing = !!course;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: course
      ? { title: course.title, code: course.code, credits: course.credits, departmentId: course.departmentId }
      : { title: "", code: "", credits: 3, departmentId: "" },
  });

  const save = useApiMutation(
    (v: Values) =>
      editing
        ? api(`/courses/${course.id}`, { method: "PATCH", body: { title: v.title, credits: v.credits } })
        : api("/courses", { method: "POST", body: v }),
    {
      success: editing ? "Course updated" : "Course created",
      onSuccess: () => {
        onOpenChange(false);
        if (!editing) reset();
      },
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit course" : "New course"}</DialogTitle>
          <DialogDescription>{editing ? "Code and department are fixed once a course exists." : "Add a course to the catalog."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4" noValidate>
          <Field label="Title" htmlFor="c-title" error={errors.title?.message}>
            <Input id="c-title" aria-invalid={!!errors.title} {...register("title")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Course code" htmlFor="c-code" error={errors.code?.message}>
              <Input id="c-code" disabled={editing} aria-invalid={!!errors.code} {...register("code")} />
            </Field>
            <Field label="Credit hours" htmlFor="c-credits" error={errors.credits?.message}>
              <Input id="c-credits" type="number" min={1} max={6} aria-invalid={!!errors.credits} {...register("credits", { valueAsNumber: true })} />
            </Field>
          </div>
          <Field label="Department" htmlFor="c-dept" error={errors.departmentId?.message}>
            <Select id="c-dept" disabled={editing} aria-invalid={!!errors.departmentId} {...register("departmentId")}>
              <option value="">Select a department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" loading={save.isPending}>
            {editing ? "Save changes" : "Create course"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewCourseButton({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> New course
      </Button>
      {open && <CourseFormDialog open={open} onOpenChange={setOpen} departments={departments} />}
    </>
  );
}

export function CourseRowActions({ course, departments }: { course: Course; departments: Department[] }) {
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const remove = useApiMutation(() => api(`/courses/${course.id}`, { method: "DELETE" }), {
    success: "Course deleted",
    onSuccess: () => setConfirm(false),
  });

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" className="size-8" aria-label={`Edit ${course.code}`} onClick={() => setEdit(true)}>
        <Pencil />
      </Button>
      <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label={`Delete ${course.code}`} onClick={() => setConfirm(true)}>
        <Trash2 />
      </Button>
      {edit && <CourseFormDialog open={edit} onOpenChange={setEdit} departments={departments} course={course} />}
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Delete ${course.code}?`}
        description="The course is soft-deleted and hidden from the catalog. Existing offerings keep their history."
        confirmLabel="Delete course"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate(undefined)}
      />
    </div>
  );
}
