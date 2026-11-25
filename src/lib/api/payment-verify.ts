import "server-only";
import { backendRequest } from "@/lib/backend";
import type { Payment } from "@/types";

export interface VerifyResult {
  ok: boolean;
  message: string;
  payment: Payment | null;
}

/** Calls the backend's public verify endpoints; Stripe's session is checked server-side, never trusted from the URL. */
export async function verifyCheckout(kind: "success" | "cancel", sessionId?: string): Promise<VerifyResult> {
  if (!sessionId) return { ok: false, message: "This page needs a checkout session. Start a payment from your enrollments.", payment: null };
  try {
    const res = await backendRequest(`/payments/${kind}?session_id=${encodeURIComponent(sessionId)}`);
    const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string; data?: Payment } | null;
    return { ok: res.ok && json?.success !== false, message: json?.message ?? "Could not verify the payment", payment: json?.data ?? null };
  } catch {
    return { ok: false, message: "We couldn't reach the server to verify your payment. Refresh in a few seconds.", payment: null };
  }
}
