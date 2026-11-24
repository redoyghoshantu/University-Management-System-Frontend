import "server-only";
import { BACKEND_API_URL } from "@/lib/backend";

type Query = Record<string, string | string[] | undefined>;

/** Unauthenticated GET for public pages. Returns null on failure so pages can render a friendly state. */
export async function publicGet<T>(path: string, query?: Query, revalidate = 120): Promise<T | null> {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) {
    const value = Array.isArray(v) ? v[0] : v;
    if (value) sp.set(k, value);
  }
  const qs = sp.toString();
  try {
    const res = await fetch(`${BACKEND_API_URL}${path}${qs ? `?${qs}` : ""}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}
