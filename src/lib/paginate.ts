import type { PageMeta } from "@/types";

/** Client-side pagination for endpoints that return a plain array (the page number still lives in the URL). */
export function paginateLocal<T>(items: T[], pageParam: string | undefined, limit = 8): { rows: T[]; meta: PageMeta } {
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const page = Math.min(Math.max(Number(pageParam) || 1, 1), totalPages);
  return { rows: items.slice((page - 1) * limit, page * limit), meta: { page, limit, total, totalPages } };
}

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
