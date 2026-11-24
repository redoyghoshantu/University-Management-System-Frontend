"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/shared/field";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Tell us a little more (at least 10 characters)").max(1000, "Keep it under 1000 characters"),
});
type Values = z.infer<typeof schema>;

export const SUPPORT_EMAIL = "support@meridian.example";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched" });

  function onSubmit(values: Values) {
    const body = `${values.message}\n\n— ${values.name} (${values.email})`;
    window.location.assign(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`);
    toast.success("Opening your email app with the message ready to send");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
      </div>
      <Field label="Subject" htmlFor="subject" error={errors.subject?.message}>
        <Input id="subject" aria-invalid={!!errors.subject} {...register("subject")} />
      </Field>
      <Field label="Message" htmlFor="message" error={errors.message?.message}>
        <Textarea id="message" rows={6} aria-invalid={!!errors.message} {...register("message")} />
      </Field>
      <Button type="submit" loading={isSubmitting} className="w-full sm:w-fit">
        Send message
      </Button>
    </form>
  );
}
