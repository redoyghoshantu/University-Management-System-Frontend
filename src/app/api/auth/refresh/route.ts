import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE } from "@/lib/constants";
import { clearSessionCookies, refreshAccessToken, setAccessCookie } from "@/lib/session";

export async function GET(req: NextRequest) {
  const rawNext = req.nextUrl.searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  const token = refresh ? await refreshAccessToken(refresh) : null;

  if (!token) {
    const res = NextResponse.redirect(new URL(`/login?reason=expired&next=${encodeURIComponent(next)}`, req.url));
    clearSessionCookies(res);
    return res;
  }
  const res = NextResponse.redirect(new URL(next, req.url));
  setAccessCookie(res, token);
  return res;
}
