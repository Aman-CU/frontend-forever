// Shared by AccountSection.tsx and DeleteAccountDialog.tsx — both call
// Better Auth endpoints (unlink-account, delete-user) that throw the same
// "session wasn't created recently enough" error when no email-verification
// flow is configured (see auth/server.ts and the Feature 57 decision entry
// in progress-tracker.md for why this project relies on the framework's
// built-in freshness check instead of building one).
export const SESSION_NOT_FRESH_CODES = new Set(["SESSION_NOT_FRESH", "SESSION_EXPIRED"]);
export const REAUTH_MESSAGE = "For your security, please sign out and sign back in, then try again.";

export function isSessionNotFreshError(code: string | undefined): boolean {
  return code !== undefined && SESSION_NOT_FRESH_CODES.has(code);
}
