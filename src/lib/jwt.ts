import type { Role } from "@/types";

export interface TokenPayload {
  id: string;
  role: Role;
  exp: number;
}

/** Decode (not verify) a JWT payload. Verification happens in the backend on every API call. */
export function decodeJwt(token?: string | null): TokenPayload | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenValid(payload: TokenPayload | null): payload is TokenPayload {
  return !!payload && payload.exp * 1000 > Date.now() + 5_000;
}
