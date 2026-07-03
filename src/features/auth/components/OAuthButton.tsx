"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { GoogleIcon } from "@/features/auth/components/GoogleIcon";
import { GithubIcon } from "@/features/auth/components/GithubIcon";

type Provider = "google" | "github";

type Props = {
  provider: Provider;
  // Where Better-Auth redirects after a successful sign-in. Defaults to
  // "/learn" (the standard post-login destination) — the login page overrides
  // this with a validated `callbackURL` query param when one is present, so a
  // link like "Log in to upgrade" can carry the user through to where they
  // were actually headed instead of dropping them back at /learn.
  callbackURL?: string;
};

const PROVIDER_CONFIG: Record<
  Provider,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  google: { label: "Continue with Google", icon: GoogleIcon },
  github: { label: "Continue with GitHub", icon: GithubIcon },
};

export function OAuthButton({ provider, callbackURL = "/learn" }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { label, icon: Icon } = PROVIDER_CONFIG[provider];

  const handleClick = async () => {
    setIsPending(true);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: "/login",
      });
      // A successful call navigates the browser away to the provider, so we
      // only ever reach here if the request failed before that redirect.
      if (error) {
        setIsPending(false);
        router.push(`/login?error=${encodeURIComponent(error.code ?? "unknown")}`);
      }
    } catch {
      setIsPending(false);
      router.push("/login?error=unknown");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled={isPending}
      onClick={handleClick}
      className="h-auto w-full gap-2.5 py-3 text-sm font-medium"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Icon className="size-4" />
      )}
      {label}
    </Button>
  );
}
