import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";
import { setSessionCookies } from "@/lib/session";
import { decodeJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!body?.email || !body?.password) {
    return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await backendRequest("/auth/login", { method: "POST", body });
  } catch {
    return NextResponse.json(
      { success: false, message: "The server is waking up. Please try again in a few seconds." },
      { status: 503 },
    );
  }

  const json = (await upstream.json().catch(() => null)) as {
    message?: string;
    data?: { accessToken: string; refreshToken: string; user?: { id: string; name: string; email: string; role: string } };
  } | null;

  if (!upstream.ok || !json?.data?.accessToken) {
    return NextResponse.json({ success: false, message: json?.message ?? "Login failed" }, { status: upstream.status || 400 });
  }

  const { accessToken, refreshToken, user } = json.data;
  const role = user?.role ?? decodeJwt(accessToken)?.role;
  const res = NextResponse.json({ success: true, message: "Login successful", data: { role, user } });
  setSessionCookies(res, accessToken, refreshToken);
  return res;
}
