import { ApiError } from "@/lib/api/errors";

type Query = Record<string, string | number | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
}

/** Browser → Next BFF (/api/bff) → backend. The BFF attaches the HTTP-only access token. */
export async function api<T>(path: string, { method = "GET", body, query }: RequestOptions = {}): Promise<T> {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  const qs = sp.toString();

  let res: Response;
  try {
    res = await fetch(`/api/bff${path}${qs ? `?${qs}` : ""}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Network error. Check your connection and try again.", 0);
  }

  const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string; data?: T } | null;
  if (!res.ok || json?.success === false) throw new ApiError(json?.message ?? `Request failed (${res.status})`, res.status);
  return json?.data as T;
}
