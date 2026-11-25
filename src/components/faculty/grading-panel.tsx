"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ClipboardList, Plus, Save, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { Field } from "@/components/shared/field";
import { api } from "@/lib/api/client";
import { gradeFor } from "@/lib/grades";
import { cn } from "@/lib/utils";
import type { Exam, ResultRow, Roster, RosterEntry } from "@/types";

const examSchema = z.object({
  type: z.enum(["MIDTERM", "FINAL"], { error: "Choose an exam type" }),
  totalMarks: z.number({ error: "Enter the total marks" }).int("Must be a whole number").min(1, "At least 1 mark").max(1000, "At most 1000 marks"),
});
type ExamValues = z.infer<typeof examSchema>;

const gradeVariant = (g?: string | null) => (!g ? "secondary" : g === "F" ? "destructive" : g === "D" || g === "C" ? "warning" : "success");

function NewExamDialog({ offeringId, existing, onCreated }: { offeringId: string; existing: Exam[]; onCreated: (exam: Exam) => void }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const taken = existing.map((e) => e.type);
  const available = (["MIDTERM", "FINAL"] as const).filter((t) => !taken.includes(t));
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamValues>({ resolver: zodResolver(examSchema), mode: "onTouched", defaultValues: { type: available[0], totalMarks: 100 } });

  const create = useMutation({
    mutationFn: (v: ExamValues) => api<Exam>("/exams", { method: "POST", body: { offeringId, ...v } }),
    onSuccess: async (exam) => {
      toast.success("Exam created");
      await qc.invalidateQueries({ queryKey: ["roster", offeringId] });
      onCreated(exam);
      setOpen(false);
    },
  });

  return (
    <>
      <Button size="sm" disabled={available.length === 0} onClick={() => setOpen(true)}>
        <Plus /> New exam
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an exam</DialogTitle>
            <DialogDescription>Each class can have one midterm and one final.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => create.mutate(v))} className="grid gap-4" noValidate>
            <Field label="Exam type" htmlFor="x-type" error={errors.type?.message}>
              <Select id="x-type" {...register("type")}>
                {available.map((t) => (
                  <option key={t} value={t}>
                    {t === "MIDTERM" ? "Midterm" : "Final"}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Total marks" htmlFor="x-total" error={errors.totalMarks?.message}>
              <Input id="x-total" type="number" min={1} aria-invalid={!!errors.totalMarks} {...register("totalMarks", { valueAsNumber: true })} />
            </Field>
            <Button type="submit" loading={create.isPending}>
              Create exam
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function GradeRow({ entry, exam, offeringId }: { entry: RosterEntry; exam: Exam; offeringId: string }) {
  const qc = useQueryClient();
  const key = ["roster", offeringId] as const;
  const saved = entry.results.find((r) => r.examId === exam.id);
  const [value, setValue] = useState(saved ? String(saved.marksObtained) : "");
  const [error, setError] = useState<string>();

  // Optimistic: marks and grade update in the table immediately; rolled back if the API rejects them.
  const save = useMutation({
    mutationFn: (marks: number) => api<ResultRow>("/results", { method: "POST", body: { examId: exam.id, enrollmentId: entry.id, marksObtained: marks } }),
    onMutate: async (marks) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Roster>(key);
      const optimistic: ResultRow = { id: saved?.id ?? `tmp-${entry.id}`, examId: exam.id, enrollmentId: entry.id, marksObtained: marks, grade: gradeFor(marks, exam.totalMarks) };
      qc.setQueryData<Roster>(key, (old) =>
        old && {
          ...old,
          enrollments: old.enrollments.map((e) => (e.id === entry.id ? { ...e, results: [...e.results.filter((r) => r.examId !== exam.id), optimistic] } : e)),
        },
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(key, ctx?.previous),
    onSuccess: () => toast.success(`Saved marks for ${entry.student.name}`),
    onSettled: () => void qc.invalidateQueries({ queryKey: key }),
  });

  function submit() {
    const n = Number(value);
    if (value.trim() === "" || Number.isNaN(n)) return setError("Enter marks");
    if (n < 0 || n > exam.totalMarks) return setError(`0 – ${exam.totalMarks}`);
    setError(undefined);
    save.mutate(n);
  }

  const dirty = !saved || String(saved.marksObtained) !== value;

  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium">{entry.student.name}</p>
        <p className="text-xs text-muted-foreground">{entry.student.email}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={exam.totalMarks}
            value={value}
            aria-label={`Marks for ${entry.student.name}`}
            aria-invalid={!!error}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={cn("h-9 w-24", error && "border-destructive")}
          />
          <span className="text-xs text-muted-foreground">/ {exam.totalMarks}</span>
        </div>
        {error && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {error}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={gradeVariant(saved?.grade)}>{saved?.grade ?? "—"}</Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <Button size="sm" variant={dirty ? "default" : "outline"} loading={save.isPending} disabled={!dirty && !!saved} onClick={submit}>
          <Save /> Save
        </Button>
      </td>
    </tr>
  );
}

export function GradingPanel({ offeringId, initialData }: { offeringId: string; initialData: Roster }) {
  const { data = initialData } = useQuery({ queryKey: ["roster", offeringId], queryFn: () => api<Roster>(`/course-offerings/${offeringId}/roster`), initialData });
  const exams = data.offering.exams;
  const [selected, setSelected] = useState<string>(exams[0]?.id ?? "");
  const exam = exams.find((e) => e.id === selected) ?? exams[0];
  const graded = exam ? data.enrollments.filter((e) => e.results.some((r) => r.examId === exam.id)).length : 0;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div role="tablist" aria-label="Exams" className="flex flex-wrap gap-2">
          {exams.map((e) => (
            <button
              key={e.id}
              role="tab"
              aria-selected={exam?.id === e.id}
              onClick={() => setSelected(e.id)}
              className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer", exam?.id === e.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary")}
            >
              {e.type === "MIDTERM" ? "Midterm" : "Final"} · {e.totalMarks}
            </button>
          ))}
          {exams.length === 0 && <span className="text-sm text-muted-foreground">No exams yet</span>}
        </div>
        <div className="flex items-center gap-3">
          {exam && (
            <span className="text-xs text-muted-foreground">
              {graded}/{data.enrollments.length} graded
            </span>
          )}
          <NewExamDialog offeringId={offeringId} existing={exams} onCreated={(x) => setSelected(x.id)} />
        </div>
      </div>

      {data.enrollments.length === 0 ? (
        <EmptyState icon={<Users />} title="No confirmed students yet" description="Students appear here once their enrollment payment is confirmed." />
      ) : !exam ? (
        <EmptyState icon={<ClipboardList />} title="Create an exam to start grading" description="Add a midterm or final, then enter marks for each student." action={<NewExamDialog offeringId={offeringId} existing={exams} onCreated={(x) => setSelected(x.id)} />} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Student</th>
                <th className="px-4 py-2.5 font-semibold">Marks</th>
                <th className="px-4 py-2.5 font-semibold">Grade</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {data.enrollments.map((e) => (
                <GradeRow key={`${exam.id}-${e.id}`} entry={e} exam={exam} offeringId={offeringId} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
