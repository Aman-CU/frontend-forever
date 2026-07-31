"use client";

import { useState, type ComponentType } from "react";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/GoogleIcon";
import { GithubIcon } from "@/components/shared/GithubIcon";
import { authClient } from "@/lib/auth/client";
import { isSessionNotFreshError, REAUTH_MESSAGE } from "@/features/settings/lib/authErrorMessages";
import { DeleteAccountDialog } from "@/features/settings/components/DeleteAccountDialog";
import type { ConnectedAccount } from "@/features/settings/lib/queries";

type Provider = "google" | "github";

const PROVIDER_CONFIG: Record<Provider, { label: string; icon: ComponentType<{ className?: string }> }> = {
  google: { label: "Google", icon: GoogleIcon },
  github: { label: "GitHub", icon: GithubIcon },
};

// Both currently-supported providers (auth/server.ts's socialProviders) —
// kept in one place so adding a third provider there is also a one-line
// change here.
const ALL_PROVIDERS: Provider[] = ["google", "github"];

// Raw error codes Better Auth's /link-social OAuth callback can redirect
// back with via errorCallbackURL (see auth/server.ts's account.accountLinking
// config and account.mjs's linkSocialAccount) — mapped to friendly copy
// rather than showing a bare code to the user.
const LINK_ERROR_MESSAGES: Record<string, string> = {
  LINKING_NOT_ALLOWED: "That account couldn't be connected — the provider didn't confirm a verified email.",
  LINKING_DIFFERENT_EMAILS_NOT_ALLOWED: "That account couldn't be connected — its email didn't match.",
  LINKING_FAILED: "That account couldn't be connected. Please try again.",
};
const DEFAULT_LINK_ERROR = "That account couldn't be connected. Please try again.";

type Props = {
  accounts: ConnectedAccount[];
  username: string;
  linkErrorCode?: string;
};

export function AccountSection({ accounts, username, linkErrorCode }: Props) {
  const connectedProviders = new Set(accounts.map((account) => account.providerId));
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);

  async function handleConnect(provider: Provider) {
    setPendingProvider(provider);
    setUnlinkError(null);
    try {
      await authClient.linkSocial({
        provider,
        callbackURL: "/settings/account",
        errorCallbackURL: "/settings/account",
      });
      // A successful call navigates the browser away to the provider's OAuth
      // consent screen — control only returns here if the request failed
      // before that redirect could happen.
    } catch {
      setUnlinkError(DEFAULT_LINK_ERROR);
    } finally {
      setPendingProvider(null);
    }
  }

  async function handleDisconnect(provider: Provider) {
    setPendingProvider(provider);
    setUnlinkError(null);
    const { error } = await authClient.unlinkAccount({ providerId: provider });
    if (error) {
      setUnlinkError(
        isSessionNotFreshError(error.code)
          ? REAUTH_MESSAGE
          : (error.message ?? "Could not disconnect that account. Please try again."),
      );
    }
    setPendingProvider(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-1 text-lg font-bold text-text-primary">Account</h2>
        <p className="mb-6 text-sm text-text-secondary">
          Manage the accounts connected to your Frontend Forever login.
        </p>

        {linkErrorCode && (
          <p className="mb-4 rounded-lg border border-error/30 bg-error-muted px-3 py-2 text-xs text-error">
            {LINK_ERROR_MESSAGES[linkErrorCode] ?? DEFAULT_LINK_ERROR}
          </p>
        )}
        {unlinkError && (
          <p className="mb-4 rounded-lg border border-error/30 bg-error-muted px-3 py-2 text-xs text-error">
            {unlinkError}
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {ALL_PROVIDERS.map((provider) => {
            const { label, icon: Icon } = PROVIDER_CONFIG[provider];
            const isConnected = connectedProviders.has(provider);
            const isPending = pendingProvider === provider;
            return (
              <li
                key={provider}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    <p className="text-xs text-text-muted">
                      {isConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDisconnect(provider)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleConnect(provider)}
                  >
                    Connect
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-lg border border-error/30 p-4">
        <h3 className="text-sm font-semibold text-text-primary">Danger zone</h3>
        <p className="mt-1 mb-3 text-sm text-text-secondary">
          Permanently delete your account and all of your data. This cannot be undone.
        </p>
        <DeleteAccountDialog username={username} />
      </div>
    </div>
  );
}
