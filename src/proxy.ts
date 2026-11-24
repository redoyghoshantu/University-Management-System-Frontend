import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, PROTECTED_PREFIXES, REFRESH_COOKIE, ROLE_HOME } from "@/lib/constants";
import { decodeJwt, isTokenValid } from "@/lib/jwt";

/**
 * Route protection + role-based redirects (Next 16 `proxy`, formerly `middleware`).
 * Authorization is enforced again by the backend on every API call.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const payload = decodeJwt(req.cookies.get(ACCESS_COOKIE)?.value);
  const valid = isTokenValid(payload);

  const rule = PROTECTED_PREFIXES.find((p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`));

  if (rule) {
    if (!valid) {
      const here = `${pathname}${search}`;
      if (req.cookies.get(REFRESH_COOKIE)) {
        return NextResponse.redirect(new URL(`/api/auth/refresh?next=${encodeURIComponent(here)}`, req.url));
      }
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(here)}`, req.url));
    }
    if (payload.role !== rule.role) {
      return NextResponse.redirect(new URL(ROLE_HOME[payload.role], req.url));
    }
  }

  if (valid && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(ROLE_HOME[payload.role], req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/faculty/:path*", "/login", "/register"],
};
