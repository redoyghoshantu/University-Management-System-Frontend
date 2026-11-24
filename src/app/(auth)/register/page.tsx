import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account", description: "Register a student account at Meridian University." };

export default function RegisterPage() {
  return <RegisterForm />;
}
