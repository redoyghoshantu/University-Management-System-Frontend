import "server-only";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/constants";
import { decodeJwt } from "@/lib/jwt";
import { backendRequest } from "@/lib/backend";

const secure = process.env.NODE_ENV === "production";
const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };

export function setAccessCookie(res: NextResponse, accessToken: string) {
  const exp = decodeJwt(accessToken)?.exp;
  const maxAge = exp ? Math.max(exp - Math.floor(Date.now() / 1000), 60) : 60 * 60 * 24;
  res.cookies.set(ACCESS_COOKIE, accessToken, { ...base, maxAge });
}

export function setSessionCookies(res: NextResponse, accessToken: string, refreshToken?: string) {
  setAccessCookie(res, accessToken);
  if (refreshToken) res.cookies.set(REFRESH_COOKIE, refreshToken, { ...base, maxAge: 60 * 60 * 24 * 30 });
}

export function clearSessionCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", { ...base, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { ...base, maxAge: 0 });
}

export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await backendRequest("/auth/refresh-token", { method: "POST", body: { refreshToken } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { accessToken?: string } };
    return json.data?.accessToken ?? null;
  } catch {
    return null;
  }
}
