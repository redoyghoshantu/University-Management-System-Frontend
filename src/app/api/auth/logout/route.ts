import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/session";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  clearSessionCookies(res);
  return res;
}

// GET variant lets server-side code redirect here when a token is rejected.
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login?reason=signed-out", req.url));
  clearSessionCookies(res);
  return res;
}
