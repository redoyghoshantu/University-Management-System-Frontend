import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/shared/profile-form";
import { getCurrentUser } from "@/lib/api/server";

export const metadata: Metadata = { title: "Profile" };

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  return (
    <>
      <PageHeader title="Profile" description="Keep your details up to date." />
      <ProfileForm user={user} />
    </>
  );
}
