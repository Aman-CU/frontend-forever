"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { isSessionNotFreshError, REAUTH_MESSAGE } from "@/features/settings/lib/authErrorMessages";
import { parseUserAgent } from "@/features/settings/lib/parseUserAgent";
import type { ActiveSession } from "@/features/settings/lib/queries";

type Props = {
  sessions: ActiveSession[];
  currentToken: string | undefined;
};

function formatLastActive(date: Date): string {
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (diffMinutes < 1) return "Active just now";
  if (diffMinutes < 60) return `Active ${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Active ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Active ${diffDays}d ago`;
}

export function SecuritySection({ sessions, currentToken }: Props) {
  const router = useRouter();
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherSessions = sessions.filter((s) => s.token !== currentToken);
  // Serializes every revoke action (individual or bulk) into a single
  // in-flight mutation at a time — without this, clicking one row's Revoke
  // while another row's Revoke or "sign out of all other devices" is still
  // in flight could fire overlapping authClient.revokeSession() calls
  // against the same token, or leave a different row's button confusingly
  // enabled mid-mutation.
  const isBusy = revokingToken !== null || revokingOthers;

  async function handleRevoke(token: string) {
    setRevokingToken(token);
    setError(null);
    try {
      const { error: revokeError } = await authClient.revokeSession({ token });
      if (revokeError) {
        setError(
          isSessionNotFreshError(revokeError.code)
            ? REAUTH_MESSAGE
            : (revokeError.message ?? "Could not end that session. Please try again."),
        );
        return;
      }
      router.refresh();
    } catch {
      setError("Could not end that session. Please try again.");
    } finally {
      setRevokingToken(null);
    }
  }

  // Deliberately not authClient.revokeOtherSessions() — that endpoint revokes
  // whatever Better Auth's own Redis session index (`active-sessions-{userId}`)
  // knows about, not the list this page actually shows. With secondaryStorage
  // configured, internal-adapter.mjs's listSessions() reads Redis only, no
  // Postgres fallback (confirmed by reading the source) — while this page's
  // list comes straight from Postgres (see getActiveSessions's comment for
  // why). If Redis's index ever drifts from Postgres, revokeOtherSessions()
  // would silently under-revoke relative to what's on screen. Revoking each
  // listed session's own token individually instead — revokeSession() *does*
  // fall back to Postgres per-token (storeSessionInDatabase: true) — keeps
  // "sign out of all other devices" honest about exactly what it signed out.
  async function handleRevokeOthers() {
    setRevokingOthers(true);
    setError(null);
    try {
      const results = await Promise.all(
        otherSessions.map((s) => authClient.revokeSession({ token: s.token })),
      );
      const firstError = results.find((result) => result.error)?.error;
      if (firstError) {
        setError(
          isSessionNotFreshError(firstError.code)
            ? REAUTH_MESSAGE
            : (firstError.message ?? "Could not sign out of other devices. Please try again."),
        );
      }
      // Refresh even on a partial failure — some of the parallel calls above
      // may have genuinely succeeded server-side, and the list should reflect
      // that regardless of whether one of the others also failed.
      router.refresh();
    } catch {
      setError("Could not sign out of other devices. Please try again.");
    } finally {
      setRevokingOthers(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-1 text-lg font-bold text-text-primary">Security</h2>
          <p className="text-sm text-text-secondary">
            Devices currently signed in to your Frontend Forever account.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={otherSessions.length === 0 || isBusy}
          onClick={handleRevokeOthers}
          className="shrink-0"
        >
          {revokingOthers && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          Sign out of all other devices
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-error/30 bg-error-muted px-3 py-2 text-xs text-error">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {sessions.map((s) => {
          const isCurrent = s.token === currentToken;
          const isRevoking = revokingToken === s.token;
          return (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{parseUserAgent(s.userAgent)}</p>
                <p className="text-xs text-text-muted">
                  {s.ipAddress ?? "IP unavailable"} · {formatLastActive(s.updatedAt)}
                </p>
              </div>
              {isCurrent ? (
                <span className="rounded-full bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent">
                  This device
                </span>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => handleRevoke(s.token)}
                >
                  {isRevoking && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
                  Revoke
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
