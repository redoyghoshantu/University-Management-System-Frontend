"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import type { Role } from "@/types";

export function UserActions({ userId, name, role, isSelf }: { userId: string; name: string; role: Role; isSelf: boolean }) {
  const [confirm, setConfirm] = useState(false);
  const changeRole = useApiMutation((next: Role) => api(`/admin/users/${userId}/role`, { method: "PATCH", body: { role: next } }), {
    success: "Role updated",
  });
  const remove = useApiMutation(() => api(`/admin/users/${userId}`, { method: "DELETE" }), {
    success: "User removed",
    onSuccess: () => setConfirm(false),
  });

  if (isSelf) return <span className="text-xs text-muted-foreground">This is you</span>;

  return (
    <div className="flex items-center justify-end gap-2">
      <Select
        aria-label={`Change role for ${name}`}
        value={role}
        disabled={changeRole.isPending}
        onChange={(e) => changeRole.mutate(e.target.value as Role)}
        className="h-8 w-32 text-xs"
      >
        <option value="STUDENT">Student</option>
        <option value="FACULTY">Faculty</option>
        <option value="ADMIN">Admin</option>
      </Select>
      <Button variant="ghost" size="icon" className="size-8 text-destructive" aria-label={`Delete ${name}`} onClick={() => setConfirm(true)}>
        <Trash2 />
      </Button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Remove ${name}?`}
        description="The account is soft-deleted: they lose access immediately but historical records are kept."
        confirmLabel="Remove user"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate(undefined)}
      />
    </div>
  );
}
