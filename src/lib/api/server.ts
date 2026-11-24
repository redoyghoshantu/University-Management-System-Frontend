import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/constants";
import { backendRequest } from "@/lib/backend";
import { ApiError } from "@/lib/api/errors";
import type { User } from "@/types";

type Query = Record<string, string | string[] | undefined>;

function toQueryString(query?: Query) {
  if (!query) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    const value = Array.isArray(v) ? v[0] : v;
    if (value) sp.set(k, value);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Authenticated GET from a Server Component. Throws ApiError (caught by error.tsx) on failure. */
export async function serverGet<T>(path: string, query?: Query): Promise<T> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/login");

  let res: Response;
  try {
    res = await backendRequest(`${path}${toQueryString(query)}`, { token });
  } catch {
    throw new ApiError("The server is waking up or unreachable. Please retry in a few seconds.", 503);
  }
  if (res.status === 401) redirect("/api/auth/logout");
  if (res.status === 404) notFound();

  const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string; data?: T } | null;
  if (!res.ok || json?.success === false) throw new ApiError(json?.message ?? "Request failed", res.status);
  return json?.data as T;
}

export async function getCurrentUser(): Promise<User> {
  return serverGet<User>("/auth/me");
}
