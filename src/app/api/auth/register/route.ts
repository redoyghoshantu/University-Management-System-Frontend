import { NextResponse } from "next/server";
import { backendRequest } from "@/lib/backend";
import { setSessionCookies } from "@/lib/session";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { name?: string; email?: string; password?: string } | null;
  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json({ success: false, message: "Name, email and password are required" }, { status: 400 });
  }

  try {
    const created = await backendRequest("/auth/register", {
      method: "POST",
      body: { name: body.name, email: body.email, password: body.password },
    });
    if (!created.ok) {
      const err = (await created.json().catch(() => null)) as { message?: string } | null;
      return NextResponse.json({ success: false, message: err?.message ?? "Registration failed" }, { status: created.status });
    }

    // Sign the new student straight in.
    const login = await backendRequest("/auth/login", { method: "POST", body: { email: body.email, password: body.password } });
    const json = (await login.json().catch(() => null)) as { data?: { accessToken: string; refreshToken: string } } | null;
    if (!login.ok || !json?.data) {
      return NextResponse.json({ success: true, message: "Account created. Please sign in.", data: { role: null } });
    }
    const res = NextResponse.json({ success: true, message: "Account created", data: { role: "STUDENT" } });
    setSessionCookies(res, json.data.accessToken, json.data.refreshToken);
    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: "The server is waking up. Please try again in a few seconds." },
      { status: 503 },
    );
  }
}
