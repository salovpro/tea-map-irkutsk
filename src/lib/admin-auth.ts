import {
  ADMIN_BASE_PATH,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin-constants";

export { ADMIN_BASE_PATH, ADMIN_SESSION_COOKIE };

const ACCESS_CODE =
  process.env.ADMIN_ACCESS_CODE?.trim() || "s6A0l4O7vaRov";

/** Stable session cookie value (Edge + Node safe, no node:crypto). */
export function createAdminSessionToken() {
  if (process.env.ADMIN_SESSION_TOKEN?.trim()) {
    return process.env.ADMIN_SESSION_TOKEN.trim();
  }
  return `tea-admin-ok:${ACCESS_CODE}`;
}

function timingSafeEqualString(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function isValidAdminSessionToken(token: string | undefined | null) {
  if (!token) return false;
  return timingSafeEqualString(token, createAdminSessionToken());
}

export function verifyAdminAccessCode(code: string) {
  return timingSafeEqualString(code.trim(), ACCESS_CODE);
}
