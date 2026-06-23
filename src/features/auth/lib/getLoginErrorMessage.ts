// Codes read directly from better-auth's callback route
// (node_modules/better-auth/dist/api/routes/callback.mjs) — only the ones
// reachable from a plain (non-account-linking) social sign-in are mapped to
// specific copy; everything else (provider misconfiguration, unrecognized
// future codes) falls back to a generic message.
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Sign-in was cancelled. Try again whenever you're ready.",
  email_not_found:
    "We couldn't get an email address from your account. Make sure your email is public or verified with this provider, or try the other sign-in option.",
  unable_to_get_user_info:
    "We couldn't retrieve your account details. Please try again.",
  invalid_code: "That sign-in link expired or was already used. Please try again.",
  no_code: "That sign-in link expired or was already used. Please try again.",
  unable_to_create_user: "We couldn't create your account. Please try again.",
  unable_to_create_session:
    "You signed in, but we couldn't start your session. Please try again.",
};

const DEFAULT_LOGIN_ERROR_MESSAGE =
  "Something went wrong signing in. Please try again.";

export function getLoginErrorMessage(code: string | null): string | null {
  if (!code) return null;
  // `code` comes from an untrusted URL query param — bracket access alone
  // would resolve inherited keys like "constructor"/"__proto__" to a
  // non-string value, which React then can't render as a child.
  if (!Object.hasOwn(LOGIN_ERROR_MESSAGES, code)) return DEFAULT_LOGIN_ERROR_MESSAGE;
  return LOGIN_ERROR_MESSAGES[code];
}
