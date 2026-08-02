"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isSessionNotFreshError, REAUTH_MESSAGE } from "@/features/settings/lib/authErrorMessages";
import { parseUserAgent } from "@/features/settings/lib/parseUserAgent";
import type { ActiveSession } from "@/features/settings/lib/queries";

type Props = {
  sessions: ActiveSession[];
  currentSessionId: string | undefined;
};

type RevokeApiResponse = {
  success?: boolean;
  error?: string;
  code?: string;
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

export function SecuritySection({ sessions, currentSessionId }: Props) {
  const router = useRouter();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherSessions = sessions.filter((s) => s.id !== currentSessionId);
  // Serializes every revoke action (individual or bulk) into a single
  // in-flight mutation at a time — without this, clicking one row's Revoke
  // while another row's Revoke or "sign out of all other devices" is still
  // in flight could fire overlapping requests, or leave a different row's
  // button confusingly enabled mid-mutation.
  const isBusy = revokingId !== null || revokingOthers;

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId);
    setError(null);
    try {
      const res = await fetch("/api/settings/security/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json().catch(() => null)) as RevokeApiResponse | null;
      if (!res.ok) {
        setError(
          isSessionNotFreshError(data?.code)
            ? REAUTH_MESSAGE
            : (data?.error ?? "Could not end that session. Please try again."),
        );
        return;
      }
      router.refresh();
    } catch {
      setError("Could not end that session. Please try again.");
    } finally {
      setRevokingId(null);
    }
  }

  async function handleRevokeOthers() {
    setRevokingOthers(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/security/revoke-others", { method: "POST" });
      const data = (await res.json().catch(() => null)) as RevokeApiResponse | null;
      if (!res.ok) {
        setError(
          isSessionNotFreshError(data?.code)
            ? REAUTH_MESSAGE
            : (data?.error ?? "Could not sign out of other devices. Please try again."),
        );
      }
      // Refresh even when the route reports an error — it attempts every
      // other session's revoke before reporting anything back (see the
      // route's own comment), so a reported failure doesn't mean nothing
      // happened; the list should reflect whatever actually succeeded.
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
          const isCurrent = s.id === currentSessionId;
          const isRevoking = revokingId === s.id;
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
                  onClick={() => handleRevoke(s.id)}
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
