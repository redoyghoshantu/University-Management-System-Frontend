import "server-only";

const DEFAULT_API = "https://university-management-system-backend-dm3a.onrender.com/api/v1";

export const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? DEFAULT_API).replace(/\/$/, "");

/** Render free tier cold-starts in ~30-50s, so the timeout is generous. */
export async function backendRequest(
  path: string,
  init: Omit<RequestInit, "body"> & { token?: string; body?: unknown } = {},
): Promise<Response> {
  const { token, body, headers: extra, ...rest } = init;
  const headers = new Headers(extra);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let payload: BodyInit | undefined;
  if (body !== undefined) {
    payload = typeof body === "string" ? body : JSON.stringify(body);
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }
  return fetch(`${BACKEND_API_URL}${path}`, {
    ...rest,
    headers,
    body: payload,
    cache: "no-store",
    signal: AbortSignal.timeout(65_000),
  });
}
