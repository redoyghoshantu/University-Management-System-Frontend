import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/constants";
import { backendRequest } from "@/lib/backend";
import { refreshAccessToken, setAccessCookie } from "@/lib/session";

type Ctx = { params: Promise<{ path: string[] }> };

async function forward(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const target = `/${path.join("/")}${req.nextUrl.search}`;
  const method = req.method;
  const body = method === "GET" || method === "DELETE" ? undefined : await req.text();

  let token = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  let refreshed: string | null = null;

  // Access cookie expires together with the JWT — transparently renew it from the refresh token.
  if (!token && refresh) {
    refreshed = await refreshAccessToken(refresh);
    token = refreshed ?? undefined;
  }

  let upstream: Response;
  try {
    upstream = await backendRequest(target, { method, token, body: body || undefined });
  } catch {
    return NextResponse.json(
      { success: false, message: "The server is waking up or unreachable. Please retry in a few seconds." },
      { status: 503 },
    );
  }

  const text = await upstream.text();
  const res = new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
  if (refreshed) setAccessCookie(res, refreshed);
  return res;
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
