"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Field } from "@/components/shared/field";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import type { Department, Semester } from "@/types";

/* ---------- Departments ---------- */
const deptSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
});
type DeptValues = z.infer<typeof deptSchema>;

function DepartmentDialog({ open, onOpenChange, department }: { open: boolean; onOpenChange: (o: boolean) => void; department?: Department }) {
  const editing = !!department;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeptValues>({ resolver: zodResolver(deptSchema), mode: "onTouched", defaultValues: { name: department?.name ?? "", code: department?.code ?? "" } });

  const save = useApiMutation(
    (v: DeptValues) => (editing ? api(`/departments/${department.id}`, { method: "PATCH", body: v }) : api("/departments", { method: "POST", body: v })),
    {
      success: editing ? "Department updated" : "Department created",
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
          <DialogTitle>{editing ? "Edit department" : "New department"}</DialogTitle>
          <DialogDescription>Departments group courses in the catalog.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4" noValidate>
          <Field label="Name" htmlFor="d-name" error={errors.name?.message}>
            <Input id="d-name" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <Field label="Code" htmlFor="d-code" error={errors.code?.message} hint="Short unique code, e.g. CSE">
            <Input id="d-code" aria-invalid={!!errors.code} {...register("code")} />
          </Field>
          <Button type="submit" loading={save.isPending}>
            {editing ? "Save changes" : "Create department"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DepartmentRow({ department }: { department: Department }) {
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const remove = useApiMutation(() => api(`/departments/${department.id}`, { method: "DELETE" }), { success: "Department deleted", onSuccess: () => setConfirm(false) });
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <Badge variant="outline">{department.code}</Badge>
        <span className="font-medium">{department.name}</span>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Edit ${department.name}`} onClick={() => setEdit(true)}>
          <Pencil />
        </Button>
        <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label={`Delete ${department.name}`} onClick={() => setConfirm(true)}>
          <Trash2 />
        </Button>
      </div>
      {edit && <DepartmentDialog open={edit} onOpenChange={setEdit} department={department} />}
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title={`Delete ${department.name}?`} description="The department is soft-deleted and hidden from filters." confirmLabel="Delete" destructive loading={remove.isPending} onConfirm={() => remove.mutate(undefined)} />
    </li>
  );
}

export function DepartmentManager({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Departments</CardTitle>
          <CardDescription>{departments.length} active</CardDescription>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus /> Add
        </Button>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <EmptyState icon={<Building2 />} title="No departments yet" description="Create the first department to start building the catalog." />
        ) : (
          <ul className="divide-y">
            {departments.map((d) => (
              <DepartmentRow key={d.id} department={d} />
            ))}
          </ul>
        )}
      </CardContent>
      {open && <DepartmentDialog open={open} onOpenChange={setOpen} />}
    </Card>
  );
}

/* ---------- Semesters ---------- */
const semSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters (e.g. Fall 2026)"),
    startDate: z.string().min(1, "Pick a start date"),
    endDate: z.string().min(1, "Pick an end date"),
    isActive: z.boolean(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.startDate < v.endDate, { path: ["endDate"], message: "End date must be after the start date" });
type SemValues = z.infer<typeof semSchema>;

const toIso = (d: string) => new Date(`${d}T00:00:00.000Z`).toISOString();
const toDateInput = (iso: string) => iso.slice(0, 10);

function SemesterDialog({ open, onOpenChange, semester }: { open: boolean; onOpenChange: (o: boolean) => void; semester?: Semester }) {
  const editing = !!semester;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SemValues>({
    resolver: zodResolver(semSchema),
    mode: "onTouched",
    defaultValues: { name: semester?.name ?? "", startDate: semester ? toDateInput(semester.startDate) : "", endDate: semester ? toDateInput(semester.endDate) : "", isActive: semester?.isActive ?? true },
  });

  const save = useApiMutation(
    (v: SemValues) => {
      const body = { name: v.name, startDate: toIso(v.startDate), endDate: toIso(v.endDate) };
      return editing ? api(`/semesters/${semester.id}`, { method: "PATCH", body: { ...body, isActive: v.isActive } }) : api("/semesters", { method: "POST", body });
    },
    {
      success: editing ? "Semester updated" : "Semester created",
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
          <DialogTitle>{editing ? "Edit semester" : "New semester"}</DialogTitle>
          <DialogDescription>Offerings are scheduled inside a semester.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4" noValidate>
          <Field label="Name" htmlFor="s-name" error={errors.name?.message}>
            <Input id="s-name" placeholder="Fall 2026" aria-invalid={!!errors.name} {...register("name")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date" htmlFor="s-start" error={errors.startDate?.message}>
              <Input id="s-start" type="date" aria-invalid={!!errors.startDate} {...register("startDate")} />
            </Field>
            <Field label="End date" htmlFor="s-end" error={errors.endDate?.message}>
              <Input id="s-end" type="date" aria-invalid={!!errors.endDate} {...register("endDate")} />
            </Field>
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[var(--primary)]" {...register("isActive")} /> Active semester
            </label>
          )}
          <Button type="submit" loading={save.isPending}>
            {editing ? "Save changes" : "Create semester"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SemesterRow({ semester }: { semester: Semester }) {
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const remove = useApiMutation(() => api(`/semesters/${semester.id}`, { method: "DELETE" }), { success: "Semester deleted", onSuccess: () => setConfirm(false) });
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="flex items-center gap-2 font-medium">
          {semester.name} {semester.isActive && <Badge variant="success">Active</Badge>}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(semester.startDate)} → {formatDate(semester.endDate)}
        </p>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Edit ${semester.name}`} onClick={() => setEdit(true)}>
          <Pencil />
        </Button>
        <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label={`Delete ${semester.name}`} onClick={() => setConfirm(true)}>
          <Trash2 />
        </Button>
      </div>
      {edit && <SemesterDialog open={edit} onOpenChange={setEdit} semester={semester} />}
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title={`Delete ${semester.name}?`} description="The semester is soft-deleted and no longer offered for enrollment." confirmLabel="Delete" destructive loading={remove.isPending} onConfirm={() => remove.mutate(undefined)} />
    </li>
  );
}

export function SemesterManager({ semesters }: { semesters: Semester[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Semesters</CardTitle>
          <CardDescription>{semesters.length} on record</CardDescription>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus /> Add
        </Button>
      </CardHeader>
      <CardContent>
        {semesters.length === 0 ? (
          <EmptyState icon={<CalendarDays />} title="No semesters yet" description="Create a semester before scheduling course offerings." />
        ) : (
          <ul className="divide-y">
            {semesters.map((s) => (
              <SemesterRow key={s.id} semester={s} />
            ))}
          </ul>
        )}
      </CardContent>
      {open && <SemesterDialog open={open} onOpenChange={setOpen} />}
    </Card>
  );
}
