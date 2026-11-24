import type { Metadata } from "next";
import { UserX } from "lucide-react";
import { UserActions } from "@/components/admin/user-actions";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { getCurrentUser, serverGet } from "@/lib/api/server";
import { first, type SearchParams } from "@/lib/paginate";
import { formatDate } from "@/lib/utils";
import type { Paginated, User } from "@/types";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const [users, me] = await Promise.all([
    serverGet<Paginated<User>>("/admin/users", {
      search: first(sp.search),
      role: first(sp.role),
      sortBy: first(sp.sortBy),
      order: first(sp.sortBy) === "createdAt" || !first(sp.sortBy) ? "desc" : "asc",
      page: first(sp.page),
      limit: "10",
    }),
    getCurrentUser(),
  ]);

  const columns: Column<User>[] = [
    {
      header: "Name",
      cell: (u) => (
        <div>
          <p className="font-medium">{u.name}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    { header: "Role", cell: (u) => <StatusBadge status={u.role} /> },
    { header: "Joined", cell: (u) => (u.createdAt ? formatDate(u.createdAt) : "—"), className: "hidden md:table-cell" },
    { header: "Actions", cell: (u) => <UserActions userId={u.id} name={u.name} role={u.role} isSelf={u.id === me.id} />, className: "text-right" },
  ];

  return (
    <>
      <PageHeader title="Users" description="Search accounts, change roles and deactivate users. Every change is written to the audit log." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput placeholder="Search name or email" />
        <FilterSelect
          param="role"
          label="Filter by role"
          allLabel="All roles"
          options={[
            { value: "STUDENT", label: "Students" },
            { value: "FACULTY", label: "Faculty" },
            { value: "ADMIN", label: "Admins" },
          ]}
        />
        <FilterSelect
          param="sortBy"
          label="Sort by"
          allLabel="Newest first"
          options={[
            { value: "name", label: "Name (A–Z)" },
            { value: "email", label: "Email (A–Z)" },
          ]}
        />
      </div>
      <DataTable
        caption="Users"
        columns={columns}
        rows={users.data}
        empty={<EmptyState icon={<UserX />} title="No users found" description="Try a different search or clear the filters." />}
      />
      <Pagination meta={users.meta} />
    </>
  );
}
